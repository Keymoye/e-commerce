"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUIStore } from '@/store/uiStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { isApiError } from '@/types/api.types';
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
  const showToast    = useUIStore((s) => s.showToast);
  const { handleError } = useErrorHandler();
  const items = CartStore((s) => s.items);
  const total = CartStore((s) => s.total);
  const clear = CartStore((s) => s.clear);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      showToast({ type: 'warning', message: 'Your cart is empty. Add items before checking out.' });
      return;
    }

    try {
      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ shippingDetails: data, items }),
      });
      const json = await res.json();

      if (isApiError(json)) {
        handleError(json);
        return;
      }

      showToast({ type: 'success', message: `Order placed! Thank you, ${data.fullName}.` });
      clear();
      reset();
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-lg mx-auto bg-primary/10 p-6 rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-center">
        Checkout Details
      </h2>

      {/* 🧍 Personal Info */}
      <div className="space-y-4">
        <FormField
          label="Full Name"
          error={errors.fullName?.message}
          inputProps={{
            ...register("fullName"),
            type: "text",
            autoComplete: "name",
          }}
        />
        <FormField
          label="Email"
          error={errors.email?.message}
          inputProps={{
            ...register("email"),
            type: "email",
            autoComplete: "email",
          }}
        />
        <FormField
          label="Phone"
          error={errors.phone?.message}
          inputProps={{
            ...register("phone"),
            type: "tel",
            autoComplete: "tel",
          }}
        />
        <FormField
          label="Address"
          error={errors.address?.message}
          inputProps={{
            ...register("address"),
            type: "text",
            autoComplete: "address-line1",
          }}
        />
        <FormField
          label="City"
          error={errors.city?.message}
          inputProps={{
            ...register("city"),
            type: "text",
            autoComplete: "address-level2",
          }}
        />
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
        className="w-full bg-secondary hover:bg-accent text-background py-2 rounded-lg font-semibold transition disabled:opacity-70"
      >
        {isSubmitting ? "Placing order..." : "Confirm Order"}
      </motion.button>
    </motion.form>
  );
}

// 🔧 Small helper for DRY input components
function FormField({
  label,
  error,
  inputProps,
}: {
  label: string;
  error?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input
        {...inputProps}
        aria-invalid={!!error}
        className={`w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-accent outline-none transition ${
          error ? "border-red-500" : "border-foreground/20"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
