import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  useEffect(() => {
    if (!exam || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, submitted]);

  const fetchExamDetails = async () => {
    try {
      const response = await api.get(`/exams/${examId}`);
      setExam(response.data.exam);
      setQuestions(response.data.questions);
      setTimeLeft(response.data.exam.duration * 60);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exam:', error);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion]._id]: answer,
    }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    const answersArray = questions.map((q) => ({
      questionId: q._id,
      selectedAnswer: answers[q._id] || '',
    }));

    try {
      const response = await api.post(`/results/${examId}/submit`, {
        answers: answersArray,
      });
      const result = response.data;
      navigate('/student/result/' + result._id);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold">Loading exam...</p>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-red-600">Exam not found</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isTimeWarning = timeLeft <= 60;

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      <div className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              isTimeWarning
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-green-500 text-white'
            }`}
          >
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm font-semibold text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <p className="text-sm text-gray-500">Progress</p>
          </div>
          <progress
            className="mt-4 w-full h-2 rounded-full overflow-hidden bg-gray-200 accent-indigo-600"
            value={currentQuestion + 1}
            max={questions.length}
          />
        </div>

        <div className="mx-auto w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
              Q{currentQuestion + 1}
            </span>
            <p className="text-lg font-semibold text-gray-900">Question {currentQuestion + 1}</p>
          </div>

          <p className="text-xl font-semibold text-gray-900 leading-relaxed mb-8">
            {currentQ.questionText}
          </p>

          {currentQ.type === 'mcq' && (
            <div className="space-y-4">
              {currentQ.options.map((option, idx) => {
                const selected = answers[currentQ._id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full rounded-3xl border px-5 py-4 text-left text-sm font-semibold transition-all duration-200 ${
                      selected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-indigo-50'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'truefalse' && (
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              {['True', 'False'].map((option) => {
                const value = option.toLowerCase();
                const selected = answers[currentQ._id] === value;
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(value)}
                    className={`w-full rounded-3xl border px-5 py-5 text-sm font-semibold transition-all duration-200 ${
                      selected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-indigo-50'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'short' && (
            <textarea
              value={answers[currentQ._id] || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              rows={5}
              className="w-full rounded-3xl border border-gray-300 bg-gray-50 px-5 py-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
              placeholder="Type your short answer here"
            />
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="w-full sm:w-40 rounded-3xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Previous
          </button>

          <div className="text-sm font-semibold text-gray-700">Question {currentQuestion + 1} of {questions.length}</div>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="w-full sm:w-44 rounded-3xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit Exam ✓
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              className="w-full sm:w-40 rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-700"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
