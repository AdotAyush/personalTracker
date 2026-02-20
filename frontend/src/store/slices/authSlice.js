import { createSlice } from '@reduxjs/toolkit';

const TOKEN_KEY = 'pt_access_token';
const USER_KEY = 'pt_user';

const loadFromStorage = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const { token: storedToken, user: storedUser } = loadFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    accessToken: storedToken,
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,
  },
  reducers: {
    setCredentials(state, { payload: { user, accessToken } }) {
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    updateUser(state, { payload }) {
      state.user = { ...state.user, ...payload };
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    },
    updateAccessToken(state, { payload: accessToken }) {
      state.accessToken = accessToken;
      localStorage.setItem(TOKEN_KEY, accessToken);
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    setAuthError(state, { payload }) {
      state.error = payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
});

export const { setCredentials, updateUser, updateAccessToken, logout, setAuthError, clearAuthError } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice.reducer;
