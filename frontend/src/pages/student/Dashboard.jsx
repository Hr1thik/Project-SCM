import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [availableExams, setAvailableExams] = useState([]);
  const [attendedExams, setAttendedExams] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [averageScore, setAverageScore] = useState(0);

  useEffect(() => {
    fetchData();
  }, [location.key]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [examsRes, resultsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/results/my'),
      ]);

      const allExams = examsRes.data;
      const myResults = resultsRes.data;

      setExams(allExams);
      setResults(myResults);

      const attendedIds = myResults
        .filter((r) => r.exam !== null)
        .map((r) => r.exam?._id?.toString() || r.exam?.toString());

      const available = allExams.filter(
        (exam) => !attendedIds.includes(exam._id.toString())
      );

      const attended = allExams.filter((exam) =>
        attendedIds.includes(exam._id.toString())
      );

      setAvailableExams(available);
      setAttendedExams(attended);

      const validResults = myResults.filter(
        (r) => r.percentage !== null && r.percentage !== undefined
      );

      if (validResults.length > 0) {
        const avg =
          validResults.reduce((sum, r) => sum + r.percentage, 0) /
          validResults.length;
        setAverageScore(Math.round(avg));
      } else {
        setAverageScore(0);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  const displayExams = activeTab === 'available' ? availableExams : attendedExams;
  const availableCount = availableExams.length;
  const attemptedCount = attendedExams.length;

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
              onClick={logout}
              className="text-sm font-semibold text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <section className="rounded-[2rem] bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 text-white p-10 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em]">Student dashboard</p>
          <h1 className="mt-4 text-4xl font-bold">Available Exams</h1>
          <p className="mt-3 max-w-2xl text-lg text-emerald-100">
            Browse your current exams and begin whenever you are ready. Track progress, review scores, and stay on top of your learning.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-indigo-600 shadow-xl p-6 text-white transition-all duration-200">
            <p className="text-3xl">📚</p>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] font-semibold text-indigo-200">
              Available
            </p>
            <p className="mt-4 text-4xl font-bold">{availableCount}</p>
          </div>

          <div className="rounded-3xl bg-green-500 shadow-xl p-6 text-white transition-all duration-200">
            <p className="text-3xl">✅</p>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] font-semibold text-green-100">
              Attended
            </p>
            <p className="mt-4 text-4xl font-bold">{attemptedCount}</p>
          </div>

          <div className="rounded-3xl bg-purple-600 shadow-xl p-6 text-white transition-all duration-200">
            <p className="text-3xl">📊</p>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] font-semibold text-purple-200">
              Average Score
            </p>
            <p className="mt-4 text-4xl font-bold">{averageScore}%</p>
          </div>
        </section>

        <section className="flex flex-wrap gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'available'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Available Exams
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attended')}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'attended'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Attended Exams
          </button>
        </section>

        <section>
          <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1">
            {loading ? (
              <div className="col-span-full rounded-3xl bg-white p-8 shadow-xl text-center text-gray-600">
                Loading exams...
              </div>
            ) : displayExams.length === 0 ? (
              <div className="col-span-full rounded-3xl bg-white p-8 shadow-xl text-center text-gray-600">
                {activeTab === 'available'
                  ? 'No available exams at the moment.'
                  : 'No attended exams yet.'}
              </div>
            ) : (
              displayExams.map((exam) => {
                const matchResult = results.find(
                  (r) =>
                    (r.exam?._id?.toString() || r.exam?.toString()) ===
                    exam._id.toString()
                );

                return (
                  <div
                    key={exam._id}
                    className="bg-white rounded-xl shadow-xl p-6 transform hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="flex justify-center text-5xl mb-5">📚</div>
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                      {exam.title}
                    </h3>
                    <div className="flex justify-center">
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                        {exam.subject}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-6 mb-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-800">⏱ Duration</p>
                        <p>{exam.duration} mins</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-800">📊 Marks</p>
                        <p>{exam.totalMarks}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Passing Marks: <span className="font-semibold text-gray-900">{exam.passingMarks}%</span>
                    </p>

                    {activeTab === 'available' ? (
                      <button
                        onClick={() => handleStartExam(exam._id)}
                        className="w-full rounded-2xl bg-green-500 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-600"
                      >
                        Start Exam →
                      </button>
                    ) : (
                      <>
                        <div className="space-y-3 mb-4">
                          <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                            <span className="rounded-full bg-gray-100 px-3 py-2">
                              Score: {matchResult?.score ?? 'N/A'}/{matchResult?.totalMarks ?? 'N/A'}
                            </span>
                            <span className="rounded-full bg-gray-100 px-3 py-2">
                              {matchResult?.percentage != null
                                ? `${matchResult.percentage.toFixed(1)}%`
                                : 'No %'}
                            </span>
                            <span className={`rounded-full px-3 py-2 text-sm font-semibold ${
                              matchResult?.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {matchResult?.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            navigate(`/student/result/${matchResult?._id}`)
                          }
                          disabled={!matchResult?._id}
                          className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          View Result →
                        </button>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
