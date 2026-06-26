const Exam = require('../models/Exam');
const Question = require('../models/Question');

exports.createExam = async (req, res) => {
  try {
    const { title, subject, duration, passingMarks, totalMarks } = req.body;

    const exam = await Exam.create({
      title,
      subject,
      duration,
      passingMarks,
      totalMarks,
      createdBy: req.user._id,
    });

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllExams = async (req, res) => {
  try {
    const query = req.user.role === 'teacher'
      ? { createdBy: req.user._id }
      : { isPublished: true };

    const exams = await Exam.find(query).sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const questions = await Question.find({ exam: req.params.id });

    res.json({ exam, questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.publishExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: not your exam' });
    }

    exam.isPublished = true;
    await exam.save();

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: not your exam' });
    }

    await exam.deleteOne();
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { questionText, type, options, correctAnswer, marks } = req.body;
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: not your exam' });
    }

    const question = await Question.create({
      exam: exam._id,
      questionText,
      type,
      options: options || [],
      correctAnswer,
      marks: marks ?? 1,
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    const exam = await Exam.findById(question.exam);
    if (!exam) {
      return res.status(404).json({
        message: 'Exam not found'
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Forbidden: not your exam'
      });
    }

    question.questionText =
      req.body.questionText || question.questionText;
    question.type =
      req.body.type || question.type;
    question.options =
      req.body.options || question.options;
    question.correctAnswer =
      req.body.correctAnswer || question.correctAnswer;
    question.marks =
      Number(req.body.marks) || question.marks;

    await question.save();
    res.json(question);

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    const exam = await Exam.findById(question.exam);
    if (!exam) {
      return res.status(404).json({
        message: 'Exam not found'
      });
    }

    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Forbidden: not your exam'
      });
    }

    await Question.findByIdAndDelete(questionId);
    res.json({ message: 'Question deleted successfully' });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};
