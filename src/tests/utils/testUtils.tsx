import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../store/authSlice";
import courseReducer from "../../store/courseSlice";

// Create a custom render function that includes providers
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        courses: courseReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  }: {
    preloadedState?: any;
    store?: any;
  } & Omit<RenderOptions, "wrapper"> = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock user data
export const mockStudent = {
  _id: "507f1f77bcf86cd799439011",
  id: "507f1f77bcf86cd799439011",
  name: "Test Student",
  email: "student@example.com",
  role: "student" as const,
};

export const mockAdmin = {
  _id: "507f1f77bcf86cd799439012",
  id: "507f1f77bcf86cd799439012",
  name: "Test Admin",
  email: "admin@example.com",
  role: "admin" as const,
};

export const mockInstructor = {
  _id: "507f1f77bcf86cd799439013",
  id: "507f1f77bcf86cd799439013",
  name: "Test Instructor",
  email: "instructor@example.com",
  role: "instructor" as const,
};

// Mock course data
export const mockCourse = {
  _id: "507f1f77bcf86cd799439020",
  title: "Introduction to JavaScript",
  description: "Learn JavaScript from scratch",
  instructor: "John Doe",
  price: 99.99,
  category: "Programming",
  tags: ["javascript", "web development"],
  thumbnail: "https://example.com/thumbnail.jpg",
  modules: [
    {
      title: "Getting Started",
      description: "Introduction to the course",
      order: 1,
      lessons: [
        {
          title: "Welcome",
          videoUrl: "https://example.com/video1.mp4",
          duration: 10,
          order: 1,
        },
      ],
    },
  ],
  batch: {
    name: "Batch 2024",
    startDate: new Date("2024-01-01"),
  },
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock quiz data
export const mockQuiz = {
  _id: "507f1f77bcf86cd799439030",
  course: "507f1f77bcf86cd799439020",
  moduleIndex: 0,
  title: "JavaScript Basics Quiz",
  questions: [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
    },
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
    },
  ],
  passingScore: 70,
};

// Mock enrollment data
export const mockEnrollment = {
  _id: "507f1f77bcf86cd799439040",
  student: mockStudent._id,
  course: mockCourse._id,
  enrolledAt: new Date(),
  progress: 0,
};

// Helper to create mock auth state
export const createMockAuthState = (
  user: typeof mockStudent | null = null,
  token: string | null = null
) => ({
  auth: {
    user,
    token,
    isAuthenticated: !!user,
    loading: false,
    error: null,
  },
});

// Helper to create mock course state
export const createMockCourseState = (courses: any[] = []) => ({
  courses: {
    courses,
    currentCourse: null,
    loading: false,
    error: null,
  },
});

// Re-export everything from testing library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
