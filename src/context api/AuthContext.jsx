import React, { cache } from 'react';
import { createContext, useState } from 'react'
import Cookies from 'js-cookie'
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
    Cookies.remove('token');
    navigate('/auth')
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