import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/db/server";
import { getUser } from "@/lib/db/get-user";

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price_kes: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total_kes: number;
  shipping_name: string;
  shipping_line_1: string;
  shipping_city: string;
  status: string;
  payment_status: string | null;
  order_items: OrderItem[];
  payments?: { status: string }[];
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ redirect_status?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: PageProps) {
  const user = await getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const { redirect_status } = await searchParams;

  const supabase = await createServerClient();
  
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        product_name,
        quantity,
        unit_price_kes
      ),
      payments (
        status
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Order not found</h1>
          <p className="mt-2 text-gray-600">The order you're looking for doesn't exist or you don't have access to it.</p>
          <a href="/products" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  const typedOrder = order as Order;
  const paymentStatus = Array.isArray(typedOrder.payments) && typedOrder.payments.length > 0
    ? typedOrder.payments[0].status
    : typedOrder.status || 'pending';
  const orderDate = new Date(typedOrder.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="mt-2 text-gray-600">Thank you for your purchase</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="border-b pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-600">Order #{typedOrder.order_number}</p>
                <p className="text-sm text-gray-600">{orderDate}</p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(paymentStatus)}`}>
                {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Items</h3>
            <div className="space-y-3">
              {typedOrder.order_items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">KES {item.unit_price_kes.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">KES {typedOrder.total_kes.toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h3>
            <div className="text-gray-700">
              <p className="font-medium">{typedOrder.shipping_name}</p>
              <p>{typedOrder.shipping_line_1}</p>
              <p>{typedOrder.shipping_city}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/products"
            className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue Shopping
          </a>
          <a
            href="/profile"
            className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Orders
          </a>
        </div>
      </div>
    </div>
  );
}
