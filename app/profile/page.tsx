"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { FaUserCircle } from "react-icons/fa";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      console.log("🔐 Checking authenticated user...");
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        console.log("⚠️ No user found, redirecting to login.");
        router.push("/auth/login");
      } else {
        console.log("✅ User found:", data.user);
        setUser(data.user);
      }
      setLoading(false);
    };

    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-foreground/70 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <FaUserCircle className="text-6xl text-secondary mb-4" />
      <h1 className="text-2xl font-semibold mb-2">
        Welcome, {user.user_metadata?.full_name || user.email}
      </h1>
      <p className="text-foreground/60 mb-4">{user.email}</p>

      <button
        onClick={async () => {
          console.log("🚪 Logging out user...");
          await supabase.auth.signOut();
          router.push("/auth/login");
        }}
        className="bg-primary text-background px-4 py-2 rounded-lg hover:opacity-90 transition"
      >
        Logout
      </button>
    </section>
  );
}
