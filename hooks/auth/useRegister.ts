"use client";
import { useToast } from "@/components/ui/toast";

export function useRegister() {
  const { toast } = useToast();
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
    return { onSubmit };
  };
}
