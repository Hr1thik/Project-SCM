import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const ViewResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    totalAttempted: 0,
    totalPassed: 0,
    totalFailed: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [examId, token]);

  const fetchResults = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [examRes, resultsRes] = await Promise.all([
        api.get(`/exams/${examId}`, { headers }),
        api.get(`/results/exam/${examId}`, { headers }),
      ]);

      const examData = examRes.data?.exam || examRes.data;
      const fetchedResults = Array.isArray(resultsRes.data)
        ? resultsRes.data
        : resultsRes.data?.results || [];
      const filteredResults = fetchedResults.filter((r) => r.student !== null);

      setExam(examData);
      setResults(filteredResults);
      calculateStats(filteredResults);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching results:', err);
      setLoading(false);
    }
  };

  const calculateStats = (resultsList) => {
    const totalAttempted = resultsList.length;
    const totalPassed = resultsList.filter((r) => r.passed).length;
    const totalFailed = totalAttempted - totalPassed;
    const averageScore =
      totalAttempted > 0
        ? (
            resultsList.reduce((sum, r) => sum + (r.score || 0), 0) /
            totalAttempted
          ).toFixed(1)
        : '0.0';

    setStats({
      totalAttempted,
      totalPassed,
      totalFailed,
      averageScore,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-lg font-semibold text-gray-700">Loading exam results...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-red-600">Exam not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="mb-6 text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{exam.title}</h2>
          <p className="text-gray-600 mt-1">Subject: {exam.subject}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg shadow">
            <h3 className="text-blue-700 text-sm font-semibold">Total Attempted</h3>
            <p className="text-2xl font-bold text-blue-900 mt-2">
              {stats.totalAttempted}
            </p>
          </div>
          <div className="bg-green-50 border border-green-100 p-4 rounded-lg shadow">
            <h3 className="text-green-700 text-sm font-semibold">Total Passed</h3>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {stats.totalPassed}
            </p>
          </div>
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg shadow">
            <h3 className="text-red-700 text-sm font-semibold">Total Failed</h3>
            <p className="text-2xl font-bold text-red-900 mt-2">
              {stats.totalFailed}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg shadow">
            <h3 className="text-purple-700 text-sm font-semibold">Average Score %</h3>
            <p className="text-2xl font-bold text-purple-900 mt-2">
              {stats.averageScore}%
            </p>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Student Results
          </h3>

          {results.length === 0 ? (
            <p className="text-center text-gray-500">
              No students have attempted this exam yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">#</th>
                    <th className="px-6 py-3 text-left font-semibold">Student Name</th>
                    <th className="px-6 py-3 text-left font-semibold">Standard</th>
                    <th className="px-6 py-3 text-left font-semibold">Email</th>
                    <th className="px-6 py-3 text-left font-semibold">Score</th>
                    <th className="px-6 py-3 text-left font-semibold">%</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={result._id || index}
                      className={`border-b ${
                        result.passed ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <td className="px-6 py-3 text-gray-700">{index + 1}</td>
                      <td className="px-6 py-3 font-semibold text-gray-800">
                        {result.student?.name || 'Unknown Student'}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {result.student?.standard || 'N/A'}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {result.student?.email || 'No Email'}
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-800">
                        {result.score != null ? `${result.score}/${result.totalMarks}` : 'N/A'}
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-800">
                        {result.percentage != null
                          ? `${Number(result.percentage).toFixed(1)}%`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded text-white text-xs font-semibold ${
                            result.passed
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        >
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {result.submittedAt
                          ? new Date(result.submittedAt).toLocaleDateString()
                          : 'Unknown Date'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewResults;
