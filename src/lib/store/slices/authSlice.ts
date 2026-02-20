import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  User,
  UserRole,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  requestEmailVerification,
  verifyEmail,
  isAdmin,
  ADMIN_ROLES,
} from '@/lib/api';
import { hasTokens, clearTokens, setTokens } from '@/lib/api/tokenStorage';
import { getErrorMessage, logError } from '@/lib/errors';

// ============================================
// Types
// ============================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  emailVerificationSent: boolean;
}

// ============================================
// Initial State
// ============================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  emailVerificationSent: false,
};

// ============================================
// Async Thunks
// ============================================

/**
 * Initialize auth state - check for existing session
 */
export const initializeAuth = createAsyncThunk<User | null, void, { rejectValue: string }>(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Check if tokens exist
      if (!hasTokens()) {
        return null;
      }
      // Try to get current user
      const user = await getCurrentUser();
      return user;
    } catch (error) {
      logError(error, 'auth/initialize');
      // Clear invalid tokens
      clearTokens();
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Login user
 */
export const login = createAsyncThunk<AuthResponse, LoginRequest, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUser(credentials);
      return response;
    } catch (error) {
      logError(error, 'auth/login');
      return rejectWithValue(getErrorMessage(error, 'login'));
    }
  }
);

/**
 * Register user
 */
export const register = createAsyncThunk<AuthResponse, RegisterRequest, { rejectValue: string }>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await registerUser(data);
      return response;
    } catch (error) {
      logError(error, 'auth/register');
      return rejectWithValue(getErrorMessage(error, 'register'));
    }
  }
);

/**
 * Logout user
 */
export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
    } catch (error) {
      logError(error, 'auth/logout');
      // Still clear tokens even if API call fails
      clearTokens();
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Request email verification OTP
 */
export const sendEmailVerification = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/sendEmailVerification',
  async (_, { rejectWithValue }) => {
    try {
      await requestEmailVerification();
    } catch (error) {
      logError(error, 'auth/sendEmailVerification');
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Verify email with OTP
 */
export const verifyEmailOtp = createAsyncThunk<void, string, { rejectValue: string }>(
  'auth/verifyEmail',
  async (code, { rejectWithValue }) => {
    try {
      await verifyEmail(code);
    } catch (error) {
      logError(error, 'auth/verifyEmail');
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================
// Auth Slice
// ============================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set user directly (for OAuth callback)
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    // Set tokens from OAuth callback
    setAuthTokens: (_, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      setTokens(action.payload.accessToken, action.payload.refreshToken);
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Reset email verification sent flag
    resetEmailVerificationSent: (state) => {
      state.emailVerificationSent = false;
    },
    // Reset auth state
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    // Initialize Auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Send Email Verification
    builder
      .addCase(sendEmailVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendEmailVerification.fulfilled, (state) => {
        state.isLoading = false;
        state.emailVerificationSent = true;
      })
      .addCase(sendEmailVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to send verification email';
      });

    // Verify Email OTP
    builder
      .addCase(verifyEmailOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmailOtp.fulfilled, (state) => {
        state.isLoading = false;
        if (state.user) {
          state.user.emailVerified = true;
        }
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Email verification failed';
      });
  },
});

// ============================================
// Export Actions
// ============================================

export const {
  setUser,
  setAuthTokens,
  clearError,
  resetEmailVerificationSent,
  resetAuth,
} = authSlice.actions;

// ============================================
// Selectors
// ============================================

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectEmailVerificationSent = (state: { auth: AuthState }) => state.auth.emailVerificationSent;

// Role-based selectors (updated for 6 admin roles)
export const selectUserRole = (state: { auth: AuthState }): UserRole | null => state.auth.user?.role ?? null;
export const selectIsAdmin = (state: { auth: AuthState }): boolean => {
  const role = state.auth.user?.role;
  return role ? isAdmin(role) : false;
};
export const selectIsUser = (state: { auth: AuthState }): boolean => state.auth.user?.role === 'USER';
export const selectIsOwner = (state: { auth: AuthState }): boolean => state.auth.user?.role === 'OWNER';
export const selectHasAdminRole = (state: { auth: AuthState }, requiredRole: UserRole): boolean => {
  const userRole = state.auth.user?.role;
  if (!userRole) return false;
  const userRoleIndex = ADMIN_ROLES.indexOf(userRole);
  const requiredRoleIndex = ADMIN_ROLES.indexOf(requiredRole);
  return userRoleIndex >= requiredRoleIndex;
};

// ============================================
// Export Reducer
// ============================================

export default authSlice.reducer;
