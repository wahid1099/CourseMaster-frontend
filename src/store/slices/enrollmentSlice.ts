import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api';

export interface Enrollment {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    category: string;
    batch: {
      name: string;
      startDate: string;
    };
  };
  enrolledAt: Date;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
}

interface EnrollmentState {
  enrollments: Enrollment[];
  stats: any;
  isLoading: boolean;
  error: string | null;
  total: number;
  pages: number;
  currentPage: number;
}

const initialState: EnrollmentState = {
  enrollments: [],
  stats: null,
  isLoading: false,
  error: null,
  total: 0,
  pages: 1,
  currentPage: 1
};

export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetchAll',
  async (params: any, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.course) queryParams.append('course', params.course);
      if (params.student) queryParams.append('student', params.student);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.search) queryParams.append('search', params.search);

      const response = await axios.get(`${API_URL}/admin/enrollments?${queryParams}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollments');
    }
  }
);

export const fetchEnrollmentStats = createAsyncThunk(
  'enrollments/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/enrollments/stats`, {
        withCredentials: true
      });
      return response.data.stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchEnrollments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchEnrollments.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.enrollments = action.payload.enrollments;
      state.total = action.payload.total;
      state.pages = action.payload.pages;
      state.currentPage = action.payload.currentPage;
    });
    builder.addCase(fetchEnrollments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchEnrollmentStats.fulfilled, (state, action: PayloadAction<any>) => {
      state.stats = action.payload;
    });
  }
});

export const { clearError } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
