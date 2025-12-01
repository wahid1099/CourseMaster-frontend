import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  category: string;
  tags: string[];
  thumbnail: string;
  modules?: any[];
  batch: {
    name: string;
    startDate: string;
  };
}

interface CoursesState {
  courses: Course[];
  currentCourse: Course | null;
  categories: string[];
  isLoading: boolean;
  error: string | null;
  total: number;
  pages: number;
  currentPage: number;
  filters: {
    search: string;
    category: string;
    sort: string;
    minPrice: number;
    maxPrice: number;
  };
}

const initialState: CoursesState = {
  courses: [],
  currentCourse: null,
  categories: [],
  isLoading: false,
  error: null,
  total: 0,
  pages: 1,
  currentPage: 1,
  filters: {
    search: '',
    category: '',
    sort: '',
    minPrice: 0,
    maxPrice: 10000
  }
};

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params: any, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice);
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);

      const response = await axios.get(`${API_URL}/courses?${queryParams}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const fetchCourse = createAsyncThunk(
  'courses/fetchCourse',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}`);
      return response.data.course;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'courses/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/courses/categories`);
      return response.data.categories;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData: Partial<Course>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/courses`, courseData, {
        withCredentials: true
      });
      return response.data.course;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course');
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, courseData }: { id: string; courseData: Partial<Course> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/courses/${id}`, courseData, {
        withCredentials: true
      });
      return response.data.course;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update course');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/courses/${id}`, {
        withCredentials: true
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CoursesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCourses.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCourses.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.courses = action.payload.courses;
      state.total = action.payload.total;
      state.pages = action.payload.pages;
      state.currentPage = action.payload.currentPage;
    });
    builder.addCase(fetchCourses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchCourse.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCourse.fulfilled, (state, action: PayloadAction<Course>) => {
      state.isLoading = false;
      state.currentCourse = action.payload;
    });
    builder.addCase(fetchCourse.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchCategories.fulfilled, (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    });

    // Create course
    builder.addCase(createCourse.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createCourse.fulfilled, (state, action: PayloadAction<Course>) => {
      state.isLoading = false;
      state.courses.unshift(action.payload);
    });
    builder.addCase(createCourse.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update course
    builder.addCase(updateCourse.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateCourse.fulfilled, (state, action: PayloadAction<Course>) => {
      state.isLoading = false;
      const index = state.courses.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
      if (state.currentCourse?._id === action.payload._id) {
        state.currentCourse = action.payload;
      }
    });
    builder.addCase(updateCourse.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete course
    builder.addCase(deleteCourse.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteCourse.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.courses = state.courses.filter(c => c._id !== action.payload);
    });
    builder.addCase(deleteCourse.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setFilters, clearFilters, setCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
