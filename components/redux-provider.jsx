"use client";

import { Provider } from "react-redux";
import { useEffect, useRef } from "react";
import { store } from "@/lib/store";
import { setUser, setLoading, setError } from "@/lib/store";

function AuthLoader({ children }) {
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadUser = async () => {
      console.log("[AuthLoader] Starting fetch to /api/user");
      store.dispatch(setLoading(true));

      try {
        const res = await fetch("/api/user", { credentials: "include" });
        console.log("[AuthLoader] Response status:", res.status);

        if (!res.ok) {
          if (res.status === 401) {
            console.log("[AuthLoader] 401 - Not authenticated");
            store.dispatch(setUser(null));
          } else {
            console.error("[AuthLoader] Error loading user", res.status);
            store.dispatch(setError(`Error ${res.status}`));
            store.dispatch(setUser(null));
          }
          store.dispatch(setLoading(false));
          return;
        }

        const data = await res.json();
        console.log("[AuthLoader] User data received:", data);
        store.dispatch(setUser(data));
        store.dispatch(setLoading(false));
        console.log("[AuthLoader] Done - user loaded");
      } catch (err) {
        console.error("[AuthLoader] Error:", err);
        store.dispatch(setError(err.message));
        store.dispatch(setUser(null));
        store.dispatch(setLoading(false));
      }
    };

    loadUser();
  }, []);

  return <>{children}</>;
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthLoader>{children}</AuthLoader>
    </Provider>
  );
}
