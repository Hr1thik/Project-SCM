const express = require('express');
const router = express.Router();

const {
  submitResult,
  getMyResults,
  getExamResults,
  getResultById,
} = require('../controllers/resultController');
const { protect, allowOnly } = require('../middleware/authMiddleware');

router.post('/:examId/submit', protect, allowOnly('student'), submitResult);
router.get('/my', protect, allowOnly('student'), getMyResults);
router.get('/exam/:examId', protect, allowOnly('teacher'), getExamResults);
router.get('/:id', protect, getResultById);

module.exports = router;
