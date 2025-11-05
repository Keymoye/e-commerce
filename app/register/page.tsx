"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";

const registerSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);

      console.log("Signup attempt:", { email: data.email });
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Signup failed 🚫",
          description: result.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account created successfully 🎉",
        description: "Redirecting...",
      });
      setTimeout(() => router.push("/"), 1000);
    } catch (err: any) {
      console.error("Unexpected error during signup:", err);
      toast({
        title: "Unexpected error ⚠️",
        description: err.message ?? "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto bg-primary p-6 rounded-xl shadow-lg mt-10"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input
            type="text"
            {...form.register("fullName")}
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
          />
          {form.formState.errors.fullName && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            autoComplete="email"
            {...form.register("email")}
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
          />
          {form.formState.errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
          />
          {form.formState.errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Confirm Password</label>
          <input
            type="password"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-background py-2 rounded-lg font-semibold hover:bg-accent transition"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-sm mt-4 text-foreground/80">
        Already have an account?{" "}
        <a href="/login" className="text-accent font-semibold hover:underline">
          Login
        </a>
      </p>
    </motion.section>
  );
}
