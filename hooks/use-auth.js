"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";

export function useAuth() {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const reduxUser = useSelector((state) => state.user);
  const loading = status === "loading" || reduxUser?.loading;

  useEffect(() => {
    if (session?.user && !reduxUser?.data) {
      // If we have session but no Redux data, fetch full user data
      fetch("/api/user", { credentials: "same-origin" })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            dispatch({
              type: "user/setUser",
              payload: data,
            });
          }
        })
        .catch(err => console.error("Failed to load user:", err));
    }
  }, [session, reduxUser?.data, dispatch]);

  // Use Redux data (has phone, profile_image) over session (only basic fields)
  const user = reduxUser?.data?.user || session?.user;

  return {
    user,
    loading,
    error: null,
    isAuthenticated: !!user,
  };
} 