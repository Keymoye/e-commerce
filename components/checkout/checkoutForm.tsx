"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/toast";
import { CartStore } from "@/store/cartStore";
import { motion } from "framer-motion";

// 🧠 Validation Schema
const checkoutSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutForm() {
  const { toast } = useToast();
  const { items, total, clear } = CartStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  // 🧾 Handle Checkout Submission
  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast({
        title: "Your cart is empty 🛒",
        description: "Add some items before checking out.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Processing your order...",
      description: "Please wait a moment.",
    });

    await new Promise((r) => setTimeout(r, 1200)); // simulate API delay

    toast({
      title: "Order placed successfully 🎉",
      description: `Thank you ${data.fullName}, your total is $${total.toFixed(
        2
      )}.`,
    });

    clear();
    reset();
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 🧍 Personal Info */}
      <div>
        <label className="block mb-1 font-medium">Full Name</label>
        <input
          type="text"
          {...register("fullName")}
          className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-accent outline-none"
        />
        {errors.fullName && (
          <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-accent outline-none"
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">Phone</label>
        <input
          type="tel"
          {...register("phone")}
          className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-accent outline-none"
        />
        {errors.phone && (
          <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* 🏠 Address */}
      <div>
        <label className="block mb-1 font-medium">Address</label>
        <input
          type="text"
          {...register("address")}
          className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-accent outline-none"
        />
        {errors.address && (
          <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">City</label>
        <input
          type="text"
          {...register("city")}
          className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-accent outline-none"
        />
        {errors.city && (
          <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
        )}
      </div>

      {/* 🛍 Summary */}
      <div className="p-4 bg-secondary/10 rounded-lg">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        {items.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between border-b border-foreground/10 pb-1"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
            <li className="flex justify-between font-bold pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </li>
          </ul>
        ) : (
          <p className="text-sm text-foreground/60">No items in cart yet 🛒</p>
        )}
      </div>

      {/* 🧾 Submit */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={isSubmitting}
        className="w-full bg-secondary hover:bg-accent text-background py-2 rounded-lg font-semibold transition"
      >
        {isSubmitting ? "Placing order..." : "Confirm Order"}
      </motion.button>
    </motion.form>
  );
}
