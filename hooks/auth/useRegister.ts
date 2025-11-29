"use client";

import { useState } from "react";
import { z } from "zod";
import { useToast } from "@/components/ui/toast";

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

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Signup failed");
      }

      toast({
        title: "Account created 🎉",
        description: "Redirecting to login...",
      });
    } catch (err: any) {
      toast({
        title: "Signup failed 🚫",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { onSubmit, loading };
}
