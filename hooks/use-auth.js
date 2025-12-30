"use client";

import { useSelector } from "react-redux";

export function useAuth() {
  const user = useSelector((state) => state.user.data);
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  };
} 