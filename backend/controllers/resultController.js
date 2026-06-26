const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');

exports.submitResult = async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    const existingResult = await Result.findOne({ exam: examId, student: req.user._id });
    if (existingResult) {
      return res.status(400).json({ message: 'Exam already attempted' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const examQuestions = await Question.find({ exam: exam._id });
    const answersMap = new Map();
    answers.forEach((answer) => {
      if (answer.questionId) {
        answersMap.set(answer.questionId.toString(), answer.selectedAnswer);
      }
    });

    let score = 0;
    const resultAnswers = examQuestions.map((question) => {
      const selectedAnswer = answersMap.get(question._id.toString()) || '';
      const isCorrect = String(selectedAnswer).trim() === String(question.correctAnswer).trim();

      if (isCorrect) {
        score += question.marks || 0;
      }

      return {
        question: question._id,
        selectedAnswer,
        isCorrect,
      };
    });

    const percentage = exam.totalMarks > 0 ? (score / exam.totalMarks) * 100 : 0;
    const passed = percentage >= exam.passingMarks;

    const result = await Result.create({
      exam: exam._id,
      student: req.user._id,
      answers: resultAnswers,
      score,
      totalMarks: exam.totalMarks,
      percentage,
      passed,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('exam', 'title subject')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: not your exam' });
    }

    const results = await Result.find({ exam: exam._id })
      .populate('student', 'name email standard')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('exam', 'title subject')
      .populate('answers.question', 'questionText correctAnswer');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
