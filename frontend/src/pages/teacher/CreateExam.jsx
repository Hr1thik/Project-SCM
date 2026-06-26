import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const CreateExam = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/exams', {
        title: formData.title,
        subject: formData.subject,
        duration: parseInt(formData.duration, 10),
        totalMarks: parseInt(formData.totalMarks, 10),
        passingMarks: parseInt(formData.passingMarks, 10),
      });

      navigate(`/teacher/add-questions/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-xl mx-auto px-4">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="text-indigo-600 font-semibold hover:text-indigo-800 transition-all duration-200"
        >
          ← Back
        </button>

        <div className="mt-6 bg-white rounded-3xl shadow-xl p-10 transition-all duration-200 hover:shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Create New Exam</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-2xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Exam Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter exam title"
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter subject"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g., 60"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Total Marks</label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-2">Passing Marks (%)</label>
              <input
                type="number"
                name="passingMarks"
                value={formData.passingMarks}
                onChange={handleChange}
                required
                min="0"
                max="100"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g., 60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-2xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating Exam...' : 'Create Exam →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
