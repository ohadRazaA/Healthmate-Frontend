import React, { cache } from 'react';
import { createContext, useState } from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'
import { useFetchData } from '../hooks/useFetchData';
import apiEndPoints, { BASE_URL } from '../constants/apiEndpoints';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const token = Cookies.get('token');
  const { data, isLoading, error } = useFetchData(
    'user-data',
    `${BASE_URL}${apiEndPoints.me}`,
    {},
    { Authorization: `Bearer ${Cookies.get("token")}` },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5000,
      refetchOnMount: false,
      cacheTime: 1000 * 60 * 5,
      enabled: !!token,
      keepPreviousData: true,
    }
  );

  const logout = () => {
    const currentToken = Cookies.get('token');
    Cookies.remove('token');
    navigate('/auth');

    // Best-effort — fire-and-forget. The user is already signed out locally either way
    // (cookie's gone); this just also tells the backend to blacklist the token server-side
    // so it can't be reused elsewhere before its 7-day expiry (see Backend/middlewares/auth.js).
    // Deliberately not awaited: local logout should never wait on or fail because of this call.
    if (currentToken) {
      axios
        .post(
          `${BASE_URL}${apiEndPoints.logout}`,
          {},
          { headers: { Authorization: `Bearer ${currentToken}` } }
        )
        .catch(() => {});
    }
  };

  return (
    <AuthContext.Provider value={{
      loader,
      setLoader,
      logout,
      data,
      isLoading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider