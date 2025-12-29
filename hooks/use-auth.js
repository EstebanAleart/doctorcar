"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";

export function useAuth() {
  const { user: auth0User, error, isLoading: loading } = useUser();
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (auth0User) {
      // Cargar datos del usuario desde la API
      fetch('/api/user')
        .then(res => res.json())
        .then(data => setLocalUser(data))
        .catch(err => console.error('Error loading user:', err));
    } else {
      setLocalUser(null);
    }
  }, [auth0User]);

  return {
    user: localUser,
    auth0User,
    loading,
    error,
    isAuthenticated: !!auth0User,
  };
} 