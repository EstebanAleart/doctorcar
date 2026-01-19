"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";

export function useAuth() {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const reduxUser = useSelector((state) => state.user?.data);
  const loading = status === "loading";

  useEffect(() => {
    if (session?.user) {
      dispatch({
        type: "user/setUser",
        payload: { user: session.user },
      });
    }
  }, [session, dispatch]);

  // Use session data directly if available, fallback to redux
  const user = session?.user || reduxUser?.user;

  return {
    user,
    loading,
    error: null,
    isAuthenticated: !!user,
  };
} 