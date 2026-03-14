import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/getUser";
import OrderCard from "@/components/profile/OrderCard";

interface UserProfile {
  id: string;
  full_name: string;
  currency_pref: string;
  created_at: string;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price_kes: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_kes: number;
  currency: string;
  created_at: string;
  order_items: OrderItem[];
}

export default async function ProfilePage() {
  const user = await getUser();
  
  if (!user) {
    redirect("/login");
  }

  const supabase = await createServerClient();
  
  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, full_name, currency_pref, created_at")
    .eq("id", user.id)
    .single();

  // Fetch orders
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total_kes,
      currency,
      created_at,
      order_items (
        product_name,
        quantity,
        unit_price_kes
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const userProfile = profile as UserProfile;
  const userOrders = orders as Order[];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const memberSince = userProfile 
    ? new Date(userProfile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {userProfile?.full_name || user.email}
          </h1>
          <p className="text-gray-600 mb-4">{user.email}</p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-500">Member since:</span>
              <span className="ml-2 text-gray-900 font-medium">{memberSince}</span>
            </div>
            <div>
              <span className="text-gray-500">Currency preference:</span>
              <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {userProfile?.currency_pref?.toUpperCase() || 'KES'}
              </span>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
          
          {!userOrders || userOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Start shopping to see your order history here.</p>
              <a
                href="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {userOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
