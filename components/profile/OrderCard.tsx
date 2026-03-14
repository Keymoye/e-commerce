"use client";

import { useState } from "react";

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

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [showItems, setShowItems] = useState(false);

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

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Order #{order.order_number}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <p className="mt-2 text-lg font-bold text-gray-900">
            KES {order.total_kes.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <button 
          onClick={() => setShowItems(!showItems)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showItems ? `Hide Items (${order.order_items.length})` : `View Items (${order.order_items.length})`}
        </button>
        {showItems && (
          <div className="mt-2 space-y-2">
            {order.order_items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                  <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  KES {item.unit_price_kes.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Actions */}
      <div className="flex justify-between items-center">
        <a
          href={`/orders/${order.id}/confirmation`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Order Details
        </a>
      </div>
    </div>
  );
}
