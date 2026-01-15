"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, setLoading, clearUser } from "@/lib/store";

export function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;
    const loadUser = async () => {
      dispatch(setLoading(true));
      try {
        const res = await fetch("/api/user", { credentials: "same-origin" });
        if (!res.ok) {
          if (!cancelled) dispatch(clearUser());
          return;
        }
        const user = await res.json();
        if (!cancelled) dispatch(setUser(user));
      } catch (e) {
        console.error("Failed to load user:", e);
        if (!cancelled) dispatch(clearUser());
      }
    };
    loadUser();
    return () => { cancelled = true; };
  }, [dispatch]);

  return null;
}
