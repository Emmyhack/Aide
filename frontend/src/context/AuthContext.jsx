import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, apiHelpers } from '../services/api';

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          // Verify token with server
          const response = await authAPI.verify();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.user,
              token,
            },
          });
        } catch (error) {
          // Token is invalid, clear stored data
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
        }
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: null });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (civicToken) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authAPI.login(civicToken);
      const { user } = response.data;
      
      // Store auth data
      localStorage.setItem('authToken', civicToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          token: civicToken,
        },
      });

      return { success: true, user };
    } catch (error) {
      const errorData = apiHelpers.handleError(error);
      dispatch({ type: 'AUTH_ERROR', payload: errorData.message });
      return { success: false, error: errorData.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear stored data regardless of API call result
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Update user profile
  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    
    // Update stored user data
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check if user has specific role or permission
  const hasPermission = (permission) => {
    if (!state.user) return false;
    // Add permission checking logic here based on your requirements
    return true;
  };

  // Check if user is event organizer
  const isEventOrganizer = (event) => {
    if (!state.user || !event) return false;
    return event.organizer?.email === state.user.email;
  };

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    logout,
    updateUser,
    clearError,
    
    // Utilities
    hasPermission,
    isEventOrganizer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;