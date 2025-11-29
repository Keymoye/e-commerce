"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useLogin } from "@/hooks/auth/useLogin";
import { useOAuthLogin } from "@/hooks/auth/useAuthLogin";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useLogin();
  const { handleOAuthLogin } = useOAuthLogin();

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  type LoginData = z.infer<typeof schema>;

  const form = useForm<LoginData>({
    resolver: zodResolver(schema),
  });

  return (
    <section className="max-w-md mx-auto bg-primary p-6 rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      <form onSubmit={form.handleSubmit(login)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            autoComplete="email"
            {...form.register("email")}
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
          />
          {form.formState.errors.email && (
            <p className="text-red-500 text-xs">
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
            <p className="text-red-500 text-xs">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-secondary text-background py-2 rounded-lg hover:bg-accent transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        <button
          onClick={() => handleOAuthLogin("google")}
          className="w-full flex items-center justify-center gap-2 bg-white text-black border py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <FcGoogle className="text-xl" /> Continue with Google
        </button>

        <button
          onClick={() => handleOAuthLogin("github")}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <FaGithub className="text-xl" /> Continue with GitHub
        </button>
      </div>

      <p className="text-center text-sm mt-4 text-foreground/80">
        Don't have an account?{" "}
        <a
          href="/register"
          className="text-accent font-semibold hover:underline"
        >
          Register
        </a>
      </p>
    </section>
  );
}
