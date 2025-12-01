import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api';

export interface Assignment {
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
  };
  title: string;
  description: string;
  submission: {
    answer: string;
    submittedAt: Date;
  };
  review?: {
    feedback: string;
    reviewedBy: {
      _id: string;
      name: string;
    };
    reviewedAt: Date;
  };
  status: 'pending' | 'submitted' | 'reviewed';
}

interface AssignmentState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  stats: any;
  isLoading: boolean;
  error: string | null;
  total: number;
  pages: number;
  currentPage: number;
}

const initialState: AssignmentState = {
  assignments: [],
  currentAssignment: null,
  stats: null,
  isLoading: false,
  error: null,
  total: 0,
  pages: 1,
  currentPage: 1
};

export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAll',
  async (params: any, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.course) queryParams.append('course', params.course);
      if (params.student) queryParams.append('student', params.student);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.search) queryParams.append('search', params.search);

      const response = await axios.get(`${API_URL}/admin/assignments?${queryParams}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignments');
    }
  }
);

export const fetchAssignmentStats = createAsyncThunk(
  'assignments/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/assignments/stats`, {
        withCredentials: true
      });
      return response.data.stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const reviewAssignment = createAsyncThunk(
  'assignments/review',
  async ({ id, feedback }: { id: string; feedback: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/admin/assignments/${id}/review`, 
        { feedback },
        { withCredentials: true }
      );
      return response.data.assignment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to review assignment');
    }
  }
);

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    setCurrentAssignment: (state, action: PayloadAction<Assignment | null>) => {
      state.currentAssignment = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAssignments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAssignments.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.assignments = action.payload.assignments;
      state.total = action.payload.total;
      state.pages = action.payload.pages;
      state.currentPage = action.payload.currentPage;
    });
    builder.addCase(fetchAssignments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchAssignmentStats.fulfilled, (state, action: PayloadAction<any>) => {
      state.stats = action.payload;
    });

    builder.addCase(reviewAssignment.fulfilled, (state, action: PayloadAction<Assignment>) => {
      const index = state.assignments.findIndex(a => a._id === action.payload._id);
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
    });
  }
});

export const { setCurrentAssignment, clearError } = assignmentSlice.actions;
export default assignmentSlice.reducer;
