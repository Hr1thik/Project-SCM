import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const ResultDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      const response = await api.get(`/results/${resultId}`);
      setResult(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching result:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold">Loading result...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-red-600">Result not found</p>
      </div>
    );
  }

  const correct = result.answers?.filter((a) => a.isCorrect).length || 0;
  const incorrect = result.answers?.filter((a) => !a.isCorrect).length || 0;

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <button
          onClick={() => navigate('/student/results')}
          className="text-indigo-600 hover:text-indigo-800 font-semibold"
        >
          ← Back to Results
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className={`mx-auto mb-6 flex h-40 w-40 items-center justify-center rounded-full ${result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <span className="text-5xl font-bold">{result.percentage?.toFixed(0) || 0}%</span>
          </div>
          <div className="mb-4">
            <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {result.passed ? 'PASSED' : 'FAILED'}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-8 text-left">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-gray-500">Score</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{result.score || 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-gray-500">Total Marks</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{result.totalMarks || 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-gray-500">✅ Correct</p>
              <p className="mt-2 text-2xl font-bold text-green-700">{correct}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-gray-500">❌ Wrong</p>
              <p className="mt-2 text-2xl font-bold text-red-700">{incorrect}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Questions Review</h2>

          {result.answers && result.answers.length > 0 ? (
            result.answers.map((answer, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                    {idx + 1}
                  </span>
                  <p className="text-lg font-semibold text-gray-900">{answer.question?.questionText || 'Question'}</p>
                </div>

                <div className={`rounded-3xl px-5 py-4 text-sm font-semibold ${answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <span>{answer.isCorrect ? '✅ Correct' : '❌ Wrong'}</span>
                  <p className="mt-2">Your Answer: {answer.selectedAnswer || '(Not answered)'}</p>
                </div>

                {!answer.isCorrect && (
                  <p className="mt-4 text-sm text-green-700 font-semibold">
                    Correct Answer: {answer.question?.correctAnswer || 'N/A'}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">No answers to review</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDetail;
