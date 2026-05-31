const mongoose = require('mongoose');
const Policy = require('../models/Policy');
const User = require('../models/User');
const LOB = require('../models/LOB');
const Carrier = require('../models/Carrier');

exports.searchPolicy = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Search parameter is required' });
    }

    const searchTerm = username.trim();
    const queryConditions = [];

    // 1. Check if the search term is a valid MongoDB ObjectId (for policy ID or user ID)
    if (mongoose.Types.ObjectId.isValid(searchTerm)) {
      queryConditions.push({ _id: searchTerm });
      queryConditions.push({ userId: searchTerm });
    }

    // 2. Search by policyNumber (case-insensitive regex)
    queryConditions.push({ policyNumber: new RegExp(searchTerm, 'i') });

    // 3. Search users by firstName or email
    const users = await User.find({
      $or: [
        { firstName: new RegExp(searchTerm, 'i') },
        { email: new RegExp(searchTerm, 'i') }
      ]
    });

    if (users.length > 0) {
      const userIds = users.map(u => u._id);
      queryConditions.push({ userId: { $in: userIds } });
    }

    // Find policies matching any of the built conditions
    const policies = await Policy.find({ $or: queryConditions })
      .populate('policyCategoryId', 'categoryName')
      .populate('companyId', 'companyName')
      .populate('userId', 'firstName email phoneNumber');

    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.aggregatePolicy = async (req, res) => {
  try {
    const aggregated = await Policy.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          userName: { $first: '$user.firstName' },
          userEmail: { $first: '$user.email' },
          totalPolicies: { $sum: 1 },
          policies: { $push: '$$ROOT' }
        }
      },
      { $sort: { totalPolicies: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: aggregated.length,
      data: aggregated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalPolicies = await Policy.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalLOBs = await LOB.countDocuments();
    const totalCarriers = await Carrier.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalPolicies,
        totalUsers,
        totalLOBs,
        totalCarriers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

