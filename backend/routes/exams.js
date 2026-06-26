// const express = require('express');
// const router = express.Router();

// const {
//   createExam,
//   getAllExams,
//   getExamById,
//   publishExam,
//   deleteExam,
//   addQuestion,
// } = require('../controllers/examController');
// const { protect, allowOnly } = require('../middleware/authMiddleware');

// router.post('/', protect, allowOnly('teacher'), createExam);
// router.get('/', protect, getAllExams);
// router.get('/:id', protect, getExamById);
// router.put('/:id/publish', protect, allowOnly('teacher'), publishExam);
// router.delete('/:id', protect, allowOnly('teacher'), deleteExam);
// router.post('/:id/questions', protect, allowOnly('teacher'), addQuestion);

// module.exports = router;



const express = require('express');
const router = express.Router();

const {
  createExam,
  getAllExams,
  getExamById,
  publishExam,
  deleteExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/examController');
const { protect, allowOnly } = require('../middleware/authMiddleware');

router.post('/', protect, allowOnly('teacher'), createExam);
router.get('/', protect, getAllExams);
router.get('/:id', protect, getExamById);
router.put('/:id/publish', protect, allowOnly('teacher'), publishExam);
router.delete('/:id', protect, allowOnly('teacher'), deleteExam);
router.post('/:id/questions', protect, allowOnly('teacher'), addQuestion);
router.put('/:id/questions/:questionId', protect, allowOnly('teacher'), updateQuestion);
router.delete('/:id/questions/:questionId', protect, allowOnly('teacher'), deleteQuestion);

module.exports = router;