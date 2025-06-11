"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn("github", {
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError(result.error);
        console.error("Sign in error:", result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Signing in..." : "Sign in with GitHub"}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
