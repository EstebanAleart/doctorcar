"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/store";

export function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Try to load user from cookies (set by callback)
    const userCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_user="));

    if (userCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userCookie.substring(9))
        );
        // For now, just set with client role (we need to fetch from DB)
        dispatch(setUser({ ...userData, role: "client" }));
      } catch (e) {
        console.error("Failed to parse auth cookie:", e);
      }
    } else {
      dispatch(setUser(null));
    }
  }, [dispatch]);

  return null;
}
