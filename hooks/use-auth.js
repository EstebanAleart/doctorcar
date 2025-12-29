"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";

export function useAuth() {
  const { user: auth0User, error, isLoading: loading } = useUser();
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (auth0User) {
      let dbUser = db.getUserByEmail(auth0User.email);
      if (!dbUser) {
        // Create user in local DB if doesn't exist
        dbUser = db.createUser({
          email: auth0User.email,
          name: auth0User.name || auth0User.email,
          role: "client", // Default role for new users
          phone: "",
          auth0Id: auth0User.sub,
        });
      }
      setLocalUser(dbUser);
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