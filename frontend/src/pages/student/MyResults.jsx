import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const MyResults = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await api.get('/results/my');
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-indigo-600 text-2xl font-bold">🎓 ExamPro</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Available Exams
            </button>
            <button
              onClick={logout}
              className="text-sm font-semibold text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🏆 My Results</h1>
          <p className="mt-2 text-gray-600">Review your exam performance and check which subjects you passed or need to improve.</p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 shadow-xl text-center text-gray-600">
            Loading results...
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 shadow-xl text-center text-gray-600">
            No exam results yet. Start taking exams!
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1">
            {results.filter(r => r.exam).map((result) => (
              <div
                key={result._id}
                className={`rounded-xl bg-white shadow-xl transition-all duration-200 hover:-translate-y-1 ${
                  result.passed ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'
                }`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <h2 className="text-xl font-bold text-gray-900">{result.exam?.title || 'Exam'}</h2>
                    <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                      {result.exam?.subject || 'N/A'}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">Percentage</p>
                    <p className="mt-2 text-5xl font-bold text-gray-900">{result.percentage.toFixed(0)}%</p>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    {result.score} / {result.totalMarks}
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                        result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {result.passed ? 'PASSED ✅' : 'FAILED ❌'}
                    </span>
                  </div>

                  <p className="text-center text-xs text-gray-500">
                    {new Date(result.submittedAt).toLocaleDateString()}
                  </p>

                  <button
                    onClick={() => navigate(`/student/result/${result._id}`)}
                    className="w-full rounded-3xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-700"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyResults;
