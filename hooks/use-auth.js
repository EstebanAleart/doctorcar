"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setError, setLoading } from "@/lib/store";

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Solo cargar si NO hay usuario en Redux Y no se ha hecho fetch
    if (user || hasFetched.current) return;

    hasFetched.current = true;
    let active = true;

    const load = async () => {
      console.log("[useAuth] Starting fetch to /api/user");
      // Set loading to true at the start
      dispatch(setLoading(true));
      
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        console.log("[useAuth] Response status:", res.status);
        if (!active) return;
        
        if (!res.ok) {
          if (res.status === 401) {
            // Not logged in, just clear data and stop loading
            dispatch(setUser(null));
          } else {
            const text = await res.text();
            console.error("Error loading user", res.status, text);
            dispatch(setError(`Error ${res.status}`));
            dispatch(setUser(null));
          }
          dispatch(setLoading(false));
          return;
        }
        
        const data = await res.json();
        if (!active) return;
        dispatch(setUser(data));
        dispatch(setLoading(false));
      } catch (err) {
        if (!active) return;
        console.error("Error loading user", err);
        dispatch(setError(err.message));
        dispatch(setUser(null));
        dispatch(setLoading(false));
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [user, loading, dispatch]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  };
} 