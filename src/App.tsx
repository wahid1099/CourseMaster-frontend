import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import StudentDashboard from "./pages/StudentDashboard";
import CourseLearning from "./pages/CourseLearning";
import QuizTaking from "./pages/QuizTaking";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AllCourses from "./pages/admin/AllCourses";
import CourseForm from "./pages/admin/CourseForm";
import Analytics from "./pages/admin/Analytics";
import Enrollments from "./pages/admin/Enrollments";
import Assignments from "./pages/admin/Assignments";
import QuizManagement from "./pages/admin/QuizManagement";
import QuizForm from "./pages/admin/QuizForm";
import SupportDashboard from "./pages/admin/SupportDashboard";
import ChatWidget from "./components/ChatWidget";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/index.css";
import "./styles/dark-mode-enhancements.css";

function App() {
  useEffect(() => {
    // Set initial theme
    const theme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Header />
          <main
            style={{ minHeight: "calc(100vh - 140px)", paddingTop: "80px" }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses/:id" element={<CourseDetailsPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute role="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/course/:id/learn"
                element={
                  <ProtectedRoute role="student">
                    <CourseLearning />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quiz/:id"
                element={
                  <ProtectedRoute role="student">
                    <QuizTaking />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes with Layout */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <AllCourses />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/courses/new"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <CourseForm />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/courses/:id/edit"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <CourseForm />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <UserManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/enrollments"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <Enrollments />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/assignments"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <Assignments />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <Analytics />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/quizzes"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <QuizManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/quizzes/new"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <QuizForm />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/quizzes/:id/edit"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <QuizForm />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/support"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout>
                      <SupportDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ChatWidget />
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
