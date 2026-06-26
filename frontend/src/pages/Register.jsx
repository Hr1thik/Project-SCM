import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [standard, setStandard] = useState('8th');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', { name, email, password, role, standard });
      setSuccess('Account created successfully! Redirecting to sign in...');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('student');
      setStandard('8th');
      setTimeout(() => navigate('/login'), 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-indigo-900 text-white flex flex-col justify-center items-center p-12">
        <div className="text-center space-y-6">
          <div className="text-6xl">🎓</div>
          <div>
            <h1 className="text-4xl font-bold">ExamPro</h1>
            <p className="mt-3 text-lg text-indigo-100">Smart Exam Management System</p>
          </div>
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-lg">
              <span className="text-green-300">✓</span>
              <span>Secure Authentication</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <span className="text-green-300">✓</span>
              <span>Role-based Access Control</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <span className="text-green-300">✓</span>
              <span>Real-time Exam Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/2 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 transition-all duration-200 hover:shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Create Account</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">👤</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Your email"
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    role === 'teacher'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    role === 'student'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Student
                </button>
              </div>
            </div>

            {role === 'student' && (
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">Student Standard</label>
                <select
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  required
                  className="w-full py-3 px-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="8th">8th</option>
                  <option value="9th">9th</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
