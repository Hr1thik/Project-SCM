import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AddQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    questionText: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: '1',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const emptyFormState = {
    questionText: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: '1',
  };

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      const response = await api.get(`/exams/${examId}`);
      setExam(response.data.exam);
      setQuestions(response.data.questions || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load exam details');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;

    try {
      await api.delete(`/exams/${examId}/questions/${questionId}`);
      setEditingQuestion(null);
      setFormData(emptyFormState);
      fetchExamDetails();
    } catch (err) {
      setError('Unable to delete question');
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText || '',
      type: question.type || 'mcq',
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      marks: question.marks?.toString() || '1',
    });
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setFormData(emptyFormState);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      questionText: formData.questionText,
      type: formData.type,
      options:
        formData.type === 'mcq'
          ? formData.options.filter((opt) => opt.trim())
          : [],
      correctAnswer: formData.correctAnswer,
      marks: parseInt(formData.marks, 10),
    };

    try {
      if (editingQuestion) {
        await api.put(
          `/exams/${examId}/questions/${editingQuestion._id}`,
          payload
        );
      } else {
        await api.post(`/exams/${examId}/questions`, payload);
      }

      setEditingQuestion(null);
      setFormData(emptyFormState);
      fetchExamDetails();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (editingQuestion ? 'Failed to update question' : 'Failed to add question')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-red-600">Exam not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="mb-6 text-indigo-600 font-semibold hover:text-indigo-800 transition-all duration-200"
        >
          ← Back to Dashboard
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-200 hover:shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Question</h2>
              <p className="text-gray-600 mt-2">{exam.title}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-2xl border border-red-200">
                {error}
              </div>
            )}

            <div className="mb-5 flex gap-3 rounded-2xl bg-gray-100 p-2">
              {['mcq', 'truefalse', 'short'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: tab }))}
                  className={`flex-1 rounded-2xl py-3 font-semibold transition-all duration-200 ${
                    formData.type === tab
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tab === 'mcq' ? 'MCQ' : tab === 'truefalse' ? 'True/False' : 'Short'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-gray-700 font-semibold mb-2">Question</label>
                <textarea
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Write the question here"
                />
              </div>

              {formData.type === 'mcq' && (
                <div className="mb-5 space-y-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={formData.options[idx]}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder={`Option ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              <div className="mb-5">
                <label className="block text-gray-700 font-semibold mb-2">Correct Answer</label>
                <input
                  type="text"
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder={
                    formData.type === 'truefalse'
                      ? 'true or false'
                      : 'Enter correct answer'
                  }
                />
              </div>

              <div className="mb-8">
                <label className="block text-gray-700 font-semibold mb-2">Marks</label>
                <input
                  type="number"
                  name="marks"
                  value={formData.marks}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter marks for this question"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 ${
                    editingQuestion
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white font-semibold py-3 rounded-2xl transition-all duration-200 disabled:opacity-50`}
                >
                  {submitting
                    ? editingQuestion
                      ? 'Updating Question...'
                      : 'Adding Question...'
                    : editingQuestion
                    ? 'Update Question'
                    : 'Add Question'}
                </button>
                {editingQuestion && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-2xl transition-all duration-200"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 transition-all duration-200 hover:shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Questions List</h3>
              <span className="text-sm text-gray-500">{questions.length} items</span>
            </div>

            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
                  No questions added yet.
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div
                    key={q._id}
                    className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <span className="min-w-[36px] h-9 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 overflow-hidden text-ellipsis max-h-14 leading-6">{q.questionText}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className={`rounded-full px-2 py-1 ${q.type === 'mcq' ? 'bg-blue-100 text-blue-700' : q.type === 'truefalse' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                            {q.type === 'mcq' ? 'MCQ' : q.type === 'truefalse' ? 'True/False' : 'Short'}
                          </span>
                          <span className="rounded-full bg-gray-100 text-gray-700 px-2 py-1">
                            {q.marks} marks
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-2xl px-4 py-2 transition-all duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl px-4 py-2 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-2xl transition-all duration-200"
            >
              ✓ Finish &amp; Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestions;
