"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AuthButtons() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {session.user.name || session.user.email}
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button 
      size="sm"
      onClick={() => signIn("auth0", { redirect: true, callbackUrl: "/" })}
    >
      Login
    </Button>
  );
}
