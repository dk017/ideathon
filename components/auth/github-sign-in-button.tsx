"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function GithubSignInButton() {
  const handleClick = () => {
    signIn("github", { callbackUrl: "/" });
  };

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full"
      onClick={handleClick}
    >
      <Github className="mr-2 h-4 w-4" />
      Continue with GitHub
    </Button>
  );
}
