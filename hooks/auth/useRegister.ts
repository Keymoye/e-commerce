"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import fetchJson from "@/lib/api";

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function useRegister() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);

      await fetchJson("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        }),
      });

      toast({
        title: "Account created 🎉",
        description: "Redirecting to login...",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      toast({
        title: "Signup failed 🚫",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { onSubmit, loading };
}
