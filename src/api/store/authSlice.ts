import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the department selection
export interface DeptSelection {
  department: string | number;
  section: string | number;
}

// Shape of the authenticated user
// Mirrors the users + companies DB columns returned by the login response.
export interface AuthUser {
  id: number;
  username: string;
  company_id: number;
  department_id: number | null;
  is_active: boolean;
  usertype: string; // Added usertype
}

export interface AuthCompany {
  id: number;
  name: string;
}

export interface AuthState {
  token: string | null;   // Sanctum personal access token
  user: AuthUser | null;
  company: AuthCompany | null;
  selection: DeptSelection | null; // Added selection
}

// Initial state
const initialState: AuthState = {
  token: null,
  user: null,
  company: null,
  selection: null, // Initialized selection
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    // Called after successful login - stores token + user + company
    setAuth: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser; company: AuthCompany }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.company = action.payload.company;
    },

    // Saves the department and section
    setSelection: (state, action: PayloadAction<DeptSelection>) => {
      state.selection = action.payload;
    },

    // Called on logout - wipes everything
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.company = null;
      state.selection = null; // Cleared selection
    },
  },
});

// Export the new action alongside the others
export const { setAuth, setSelection, clearAuth } = authSlice.actions;
export default authSlice.reducer;