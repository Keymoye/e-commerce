"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/toast";

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
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Login failed 🚫",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back 👋",
        description: "Redirecting to your dashboard...",
      });
      router.push("/");
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
    </section>
  );
}
