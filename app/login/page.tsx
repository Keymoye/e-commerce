"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/toast";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    console.log("loading...", loading);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    console.log("Login attempt:", { email: data.email, error });
    setLoading(false);

    if (error) {
      console.log("Login error:", error);
      toast({
        title: "Login failed 🚫",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log("Login successful");
      toast({
        title: "Welcome back 👋",
        description: "Redirecting to your dashboard...",
      });
      router.push("/");
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setLoading(true);
      console.log("loading...", loading);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("OAuth login error:", error);
        toast({
          title: "Login failed 🚫",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("OAuth login successful:", data);
      toast({
        title: "Welcome back 👋",
        description: "Redirecting to your dashboard...",
      });

      router.push("/");
    } catch (err: any) {
      console.error("Unexpected error during OAuth login:", err);
      toast({
        title: "Unexpected error ⚠️",
        description: err.message ?? "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto bg-primary p-6 rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
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
