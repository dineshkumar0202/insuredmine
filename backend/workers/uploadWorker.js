const { workerData, parentPort } = require('worker_threads');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Agent = require('../models/Agent');
const User = require('../models/User');
const UserAccount = require('../models/UserAccount');
const LOB = require('../models/LOB');
const Carrier = require('../models/Carrier');
const Policy = require('../models/Policy');

async function processFile() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the worker environment');
    }
    
    await mongoose.connect(process.env.MONGO_URI);

    const workbook = xlsx.read(workerData.fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false, defval: '' });

    let count = 0;

    for (let i = 0; i < rawData.length; i++) {
      const row = {};
      for (const key in rawData[i]) {
        row[key.toLowerCase().trim()] = rawData[i][key];
      }

      const agentName = row['agentname'] || '';
      const firstName = row['firstname'] || '';
      const dob = row['dob'] ? new Date(row['dob']) : null;
      const address = row['address'] || '';
      const phoneNumber = row['phonenumber'] || '';
      const state = row['state'] || '';
      const zipCode = row['zipcode'] || '';
      const email = row['email'] || '';
      const gender = row['gender'] || '';
      const userType = row['usertype'] || '';
      const accountName = row['accountname'] || '';
      const categoryName = row['categoryname'] || '';
      const companyName = row['companyname'] || '';
      const policyNumber = row['policynumber'] || '';
      const policyStartDate = row['policystartdate'] ? new Date(row['policystartdate']) : null;
      const policyEndDate = row['policyenddate'] ? new Date(row['policyenddate']) : null;

      if (!email) continue;

      // 1. upsert Agent
      await Agent.findOneAndUpdate(
        { agentName },
        { agentName },
        { upsert: true, new: true }
      );

      // 2. upsert User
      const user = await User.findOneAndUpdate(
        { email },
        { firstName, dob, address, phoneNumber, state, zipCode, email, gender, userType },
        { upsert: true, new: true }
      );

      // 3. upsert UserAccount
      await UserAccount.findOneAndUpdate(
        { accountName, userId: user._id },
        { accountName, userId: user._id },
        { upsert: true, new: true }
      );

      // 4. upsert LOB
      const lob = await LOB.findOneAndUpdate(
        { categoryName },
        { categoryName },
        { upsert: true, new: true }
      );

      // 5. upsert Carrier
      const carrier = await Carrier.findOneAndUpdate(
        { companyName },
        { companyName },
        { upsert: true, new: true }
      );

      // 6. create/upsert Policy
      await Policy.findOneAndUpdate(
        { policyNumber },
        {
          policyNumber,
          policyStartDate,
          policyEndDate,
          policyCategoryId: lob._id,
          companyId: carrier._id,
          userId: user._id
        },
        { upsert: true, new: true }
      );

      count++;
    }

    await mongoose.disconnect();
    parentPort.postMessage({ success: true, inserted: count });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
}

processFile();
