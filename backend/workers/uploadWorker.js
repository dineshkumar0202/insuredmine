const { workerData, parentPort } = require('worker_threads');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Override DNS servers to Google DNS to resolve MongoDB SRV records properly
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Agent = require('../models/Agent');
const User = require('../models/User');
const UserAccount = require('../models/UserAccount');
const LOB = require('../models/LOB');
const Carrier = require('../models/Carrier');
const Policy = require('../models/Policy');

const BATCH_SIZE = 500;

async function processFile() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the worker environment');
    }

    await mongoose.connect(process.env.MONGO_URI);

    const workbook = xlsx.read(workerData.fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false, defval: '' });

    // --- Phase 1: Parse all rows and collect unique values ---
    const rows = [];
    const uniqueAgents = new Set();
    const uniqueEmails = new Map();     // email -> user row data
    const uniqueLOBs = new Set();
    const uniqueCarriers = new Set();

    for (let i = 0; i < rawData.length; i++) {
      const row = {};
      for (const key in rawData[i]) {
        row[key.toLowerCase().trim()] = rawData[i][key];
      }

      const email = row['email'] || '';
      if (!email) continue;

      const parsed = {
        agentName: row['agentname'] || '',
        firstName: row['firstname'] || '',
        dob: row['dob'] ? new Date(row['dob']) : null,
        address: row['address'] || '',
        phoneNumber: row['phonenumber'] || '',
        state: row['state'] || '',
        zipCode: row['zipcode'] || '',
        email,
        gender: row['gender'] || '',
        userType: row['usertype'] || '',
        accountName: row['accountname'] || '',
        categoryName: row['categoryname'] || '',
        companyName: row['companyname'] || '',
        policyNumber: row['policynumber'] || '',
        policyStartDate: row['policystartdate'] ? new Date(row['policystartdate']) : null,
        policyEndDate: row['policyenddate'] ? new Date(row['policyenddate']) : null,
      };

      rows.push(parsed);

      if (parsed.agentName) uniqueAgents.add(parsed.agentName);
      if (parsed.categoryName) uniqueLOBs.add(parsed.categoryName);
      if (parsed.companyName) uniqueCarriers.add(parsed.companyName);
      uniqueEmails.set(email, parsed);
    }

    // --- Phase 2: Bulk upsert Agents, LOBs, Carriers, Users ---

    // Agents
    if (uniqueAgents.size > 0) {
      const agentOps = [...uniqueAgents].map(name => ({
        updateOne: {
          filter: { agentName: name },
          update: { $setOnInsert: { agentName: name } },
          upsert: true,
        }
      }));
      await Agent.bulkWrite(agentOps, { ordered: false });
    }

    // LOBs
    if (uniqueLOBs.size > 0) {
      const lobOps = [...uniqueLOBs].map(name => ({
        updateOne: {
          filter: { categoryName: name },
          update: { $setOnInsert: { categoryName: name } },
          upsert: true,
        }
      }));
      await LOB.bulkWrite(lobOps, { ordered: false });
    }

    // Carriers
    if (uniqueCarriers.size > 0) {
      const carrierOps = [...uniqueCarriers].map(name => ({
        updateOne: {
          filter: { companyName: name },
          update: { $setOnInsert: { companyName: name } },
          upsert: true,
        }
      }));
      await Carrier.bulkWrite(carrierOps, { ordered: false });
    }

    // Users (upsert with full data — last row for duplicate emails wins)
    if (uniqueEmails.size > 0) {
      const userOps = [...uniqueEmails.values()].map(u => ({
        updateOne: {
          filter: { email: u.email },
          update: {
            $set: {
              firstName: u.firstName,
              dob: u.dob,
              address: u.address,
              phoneNumber: u.phoneNumber,
              state: u.state,
              zipCode: u.zipCode,
              email: u.email,
              gender: u.gender,
              userType: u.userType,
            }
          },
          upsert: true,
        }
      }));
      await User.bulkWrite(userOps, { ordered: false });
    }

    // --- Phase 3: Build lookup maps from DB (single query each) ---
    const [lobDocs, carrierDocs, userDocs] = await Promise.all([
      LOB.find({ categoryName: { $in: [...uniqueLOBs] } }).lean(),
      Carrier.find({ companyName: { $in: [...uniqueCarriers] } }).lean(),
      User.find({ email: { $in: [...uniqueEmails.keys()] } }).lean(),
    ]);

    const lobMap = new Map(lobDocs.map(d => [d.categoryName, d._id]));
    const carrierMap = new Map(carrierDocs.map(d => [d.companyName, d._id]));
    const userMap = new Map(userDocs.map(d => [d.email, d._id]));

    // --- Phase 4: Bulk upsert UserAccounts and Policies in batches ---
    let count = 0;

    for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
      const batch = rows.slice(batchStart, batchStart + BATCH_SIZE);

      const accountOps = [];
      const policyOps = [];

      for (const r of batch) {
        const userId = userMap.get(r.email);
        if (!userId) continue;

        // UserAccount upsert
        if (r.accountName) {
          accountOps.push({
            updateOne: {
              filter: { accountName: r.accountName, userId },
              update: { $setOnInsert: { accountName: r.accountName, userId } },
              upsert: true,
            }
          });
        }

        // Policy upsert
        if (r.policyNumber) {
          policyOps.push({
            updateOne: {
              filter: { policyNumber: r.policyNumber },
              update: {
                $set: {
                  policyNumber: r.policyNumber,
                  policyStartDate: r.policyStartDate,
                  policyEndDate: r.policyEndDate,
                  policyCategoryId: lobMap.get(r.categoryName) || null,
                  companyId: carrierMap.get(r.companyName) || null,
                  userId,
                }
              },
              upsert: true,
            }
          });
          count++;
        }
      }

      // Fire both bulk writes in parallel per batch
      const ops = [];
      if (accountOps.length > 0) ops.push(UserAccount.bulkWrite(accountOps, { ordered: false }));
      if (policyOps.length > 0) ops.push(Policy.bulkWrite(policyOps, { ordered: false }));
      await Promise.all(ops);
    }

    await mongoose.disconnect();
    parentPort.postMessage({ success: true, inserted: count });
  } catch (error) {
    try { await mongoose.disconnect(); } catch (_) {}
    parentPort.postMessage({ success: false, error: error.message });
  }
}

processFile();
