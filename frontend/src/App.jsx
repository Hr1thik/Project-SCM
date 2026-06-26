import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/teacher/Dashboard';
import CreateExam from './pages/teacher/CreateExam';
import AddQuestions from './pages/teacher/AddQuestions';
import ViewResults from './pages/teacher/ViewResults';
import StudentDashboard from './pages/student/Dashboard';
import TakeExam from './pages/student/TakeExam';
import MyResults from './pages/student/MyResults';
import ResultDetail from './pages/student/ResultDetail';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/create-exam"
            element={
              <ProtectedRoute role="teacher">
                <CreateExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/add-questions/:examId"
            element={
              <ProtectedRoute role="teacher">
                <AddQuestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/results/:examId"
            element={
              <ProtectedRoute role="teacher">
                <ViewResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam/:examId"
            element={
              <ProtectedRoute role="student">
                <TakeExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results"
            element={
              <ProtectedRoute role="student">
                <MyResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/result/:resultId"
            element={
              <ProtectedRoute role="student">
                <ResultDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
