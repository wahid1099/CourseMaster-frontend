import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import themeReducer from './slices/themeSlice';
import userManagementReducer from './slices/userManagementSlice';
import enrollmentReducer from './slices/enrollmentSlice';
import assignmentReducer from './slices/assignmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    theme: themeReducer,
    userManagement: userManagementReducer,
    enrollments: enrollmentReducer,
    assignments: assignmentReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
