import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://course-master-backend-chi.vercel.app/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "moderator" | "teacher" | "instructor";
  isActive: boolean;
  lastLogin?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  permissions: string[];
  bio?: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Array<{
    _id: string;
    count: number;
    active: number;
  }>;
}

interface UserFilters {
  role: string;
  status: string;
  search: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UserManagementState {
  users: User[];
  currentUser: User | null;
  stats: UserStats | null;
  filters: UserFilters;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
}

const initialState: UserManagementState = {
  users: [],
  currentUser: null,
  stats: null,
  filters: {
    role: "",
    status: "",
    search: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  "userManagement/fetchUsers",
  async (
    params: {
      page?: number;
      limit?: number;
      role?: string;
      status?: string;
      search?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.role) queryParams.append("role", params.role);
      if (params.status) queryParams.append("status", params.status);
      if (params.search) queryParams.append("search", params.search);

      const response = await axios.get(
        `${API_URL}/admin/users?${queryParams.toString()}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  "userManagement/fetchUserStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/users/stats`, {
        withCredentials: true,
      });
      return response.data.stats;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user stats"
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "userManagement/fetchUserById",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/users/${userId}`, {
        withCredentials: true,
      });
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "userManagement/createUser",
  async (
    userData: Partial<User> & { password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/admin/users`, userData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create user"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "userManagement/updateUser",
  async (
    { userId, userData }: { userId: string; userData: Partial<User> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/users/${userId}`,
        userData,
        {
          withCredentials: true,
        }
      );
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "userManagement/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        withCredentials: true,
      });
      return userId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "userManagement/toggleUserStatus",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/status`,
        {},
        {
          withCredentials: true,
        }
      );
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle user status"
      );
    }
  }
);

export const changeUserRole = createAsyncThunk(
  "userManagement/changeUserRole",
  async (
    { userId, role }: { userId: string; role: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/role`,
        { role },
        {
          withCredentials: true,
        }
      );
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change user role"
      );
    }
  }
);

const userManagementSlice = createSlice({
  name: "userManagement",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user stats
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle user status
    builder.addCase(toggleUserStatus.fulfilled, (state, action) => {
      const index = state.users.findIndex((u) => u._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    });

    // Change user role
    builder.addCase(changeUserRole.fulfilled, (state, action) => {
      const index = state.users.findIndex((u) => u._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    });
  },
});

export const { setFilters, clearFilters, setCurrentUser, clearError } =
  userManagementSlice.actions;
export default userManagementSlice.reducer;
