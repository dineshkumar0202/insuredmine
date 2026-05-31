const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');

router.get('/search', policyController.searchPolicy);
router.get('/aggregate', policyController.aggregatePolicy);
router.get('/stats', policyController.getStats);

module.exports = router;
