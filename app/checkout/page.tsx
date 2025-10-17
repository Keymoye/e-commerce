"use client";

import CheckoutForm from "@/components/checkout/checkoutForm";

export default function CheckoutPage() {
  return (
    <section className="max-w-2xl mx-auto mt-10 bg-primary/5 p-6 rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold mb-4 text-center">Checkout</h1>
      <CheckoutForm />
    </section>
  );
}
