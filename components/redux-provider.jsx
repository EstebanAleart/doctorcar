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
      store.dispatch(setLoading(true));

      try {
        const res = await fetch("/api/user", { credentials: "include" });

        if (!res.ok) {
          if (res.status === 401) {
            store.dispatch(setUser(null));
          } else {
            store.dispatch(setError(`Error ${res.status}`));
            store.dispatch(setUser(null));
          }
          store.dispatch(setLoading(false));
          return;
        }

        const data = await res.json();
        store.dispatch(setUser(data));
        store.dispatch(setLoading(false));
      } catch (err) {
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
