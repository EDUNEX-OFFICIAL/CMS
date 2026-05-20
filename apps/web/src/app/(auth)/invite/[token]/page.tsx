"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@repo/ui";
import { acceptInvite } from "@/lib/api";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [message, setMessage] = useState("Accepting invite...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const result = await acceptInvite(params.token);
      if (!result.success) {
        setError(result.error.message);
        setMessage("Invite could not be accepted");
        return;
      }
      setMessage("Invite accepted. Redirecting to dashboard...");
      router.push("/dashboard");
    }
    void run();
  }, [params.token, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-700">{message}</p>
        {error ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {error ? (
          <Button className="mt-6" onClick={() => router.push("/login")}>
            Go to login
          </Button>
        ) : null}
      </div>
    </main>
  );
}
