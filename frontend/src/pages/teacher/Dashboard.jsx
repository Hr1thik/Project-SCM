import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const examsRes = await api.get('/exams');
      const examsData = examsRes.data;

      const examsWithDetails = await Promise.all(
        examsData.map(async (exam) => {
          try {
            const detailRes = await api.get('/exams/' + exam._id);
            return {
              ...exam,
              questionCount: detailRes.data.questions?.length || 0,
            };
          } catch {
            return { ...exam, questionCount: 0 };
          }
        })
      );

      setExams(examsWithDetails);

      const totalQ = examsWithDetails.reduce(
        (sum, e) => sum + e.questionCount,
        0
      );
      setTotalQuestions(totalQ);

      const publishedExams = examsWithDetails.filter((e) => e.isPublished);
      const allResults = await Promise.all(
        publishedExams.map((exam) =>
          api
            .get('/results/exam/' + exam._id)
            .then((r) => r.data)
            .catch(() => [])
        )
      );

      const flatResults = allResults.flat();
      const uniqueIds = [
        ...new Set(
          flatResults
            .map((r) => r.student?._id?.toString())
            .filter(Boolean)
        ),
      ];
      setTotalStudents(uniqueIds.length);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;

    try {
      await api.delete(`/exams/${examId}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Failed to delete exam');
    }
  };

  const handlePublish = async (examId) => {
    try {
      await api.put(`/exams/${examId}/publish`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error publishing exam:', error);
      alert('Failed to publish exam');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎓</span>
            <h1 className="text-2xl font-bold text-gray-900">ExamPro</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-semibold">{user?.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 text-white rounded-[2rem] p-8 shadow-xl mb-8 transition-all duration-200 hover:shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Welcome back</p>
              <h2 className="text-4xl font-bold mt-3">Hello, {user?.name}</h2>
              <p className="mt-4 max-w-2xl text-indigo-100">
                Manage exams, publish questions, and track student performance in one place.
              </p>
            </div>
            <button
              onClick={() => navigate('/teacher/create-exam')}
              className="inline-flex items-center justify-center bg-white text-indigo-700 px-6 py-3 rounded-2xl font-semibold shadow-md hover:bg-gray-100 transition-all duration-200"
            >
              Create New Exam
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-3xl shadow transition-all duration-200 hover:shadow-lg p-6 border border-gray-100">
            <div className="text-2xl">📝</div>
            <p className="text-sm text-gray-500 mt-4">Total Exams</p>
            <p className="text-4xl font-bold text-indigo-600 mt-3">{exams.length}</p>
          </div>
          <div className="bg-white rounded-3xl shadow transition-all duration-200 hover:shadow-lg p-6 border border-gray-100">
            <div className="text-2xl">✅</div>
            <p className="text-sm text-gray-500 mt-4">Published</p>
            <p className="text-4xl font-bold text-emerald-600 mt-3">{exams.filter((e) => e.isPublished).length}</p>
          </div>
          <div className="bg-white rounded-3xl shadow transition-all duration-200 hover:shadow-lg p-6 border border-gray-100">
            <div className="text-2xl">❓</div>
            <p className="text-sm text-gray-500 mt-4">Questions</p>
            <p className="text-4xl font-bold text-purple-600 mt-3">{totalQuestions}</p>
          </div>
          <div className="bg-white rounded-3xl shadow transition-all duration-200 hover:shadow-lg p-6 border border-gray-100">
            <div className="text-2xl">👥</div>
            <p className="text-sm text-gray-500 mt-4">Students</p>
            <p className="text-4xl font-bold text-orange-500 mt-3">{totalStudents}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="lg:col-span-3 bg-white rounded-3xl shadow p-8 text-center text-gray-500">
              Loading exams...
            </div>
          ) : exams.length === 0 ? (
            <div className="lg:col-span-3 bg-white rounded-3xl shadow p-8 text-center text-gray-500">
              No exams created yet.
            </div>
          ) : (
            exams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white border-l-4 border-indigo-600 rounded-3xl shadow-sm p-6 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{exam.title}</h3>
                    <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold mt-3">
                      {exam.subject}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{exam.duration} mins</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-600">
                  <div className="bg-gray-100 rounded-2xl px-3 py-2">Marks: {exam.totalMarks}</div>
                  <div className="bg-gray-100 rounded-2xl px-3 py-2">Questions: {exam.questionCount}</div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      exam.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {exam.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {exam.isPublished && (
                    <button
                      onClick={() => navigate(`/teacher/results/${exam._id}`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-200"
                    >
                      View Results
                    </button>
                  )}
                  {!exam.isPublished && (
                    <button
                      onClick={() => handlePublish(exam._id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-200"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(exam._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
