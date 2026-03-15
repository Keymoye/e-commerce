"use client";

import CheckoutForm from "@/components/forms/checkout-form";
import { ErrorBoundary } from "@/components/ui/error-boundary";

function CheckoutFallback() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center my-8">
      <p className="font-medium text-red-700">Failed to load checkout.</p>
      <p className="text-sm text-red-500 mt-1">Please refresh the page to try again.</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
      <section className="max-w-2xl mx-auto mt-10 bg-primary/5 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Checkout</h1>
        <ErrorBoundary fallback={<CheckoutFallback />}>
          <CheckoutForm />
        </ErrorBoundary>
      </section>
  );
}
