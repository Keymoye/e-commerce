import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminOrderById } from '@/services/admin/orders';
import { ORDER_STATUS_COLORS } from '@/lib/utils/format';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  let order;
  try {
    order = await getAdminOrderById(id);
  } catch {
    notFound();
  }

  const statusColor = ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-800';

  return (
    <div className="max-w-3xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to orders
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900">
            Order {order.order_number}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Placed {new Date(order.created_at).toLocaleDateString('en-KE', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
            {' · '}{order.auth_users?.email}
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Order items */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="font-medium text-gray-900 text-sm">Items</h3>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-2 text-left font-medium text-gray-600">Product</th>
              <th className="px-4 py-2 text-center font-medium text-gray-600">Qty</th>
              <th className="px-4 py-2 text-right font-medium text-gray-600">Unit price</th>
              <th className="px-4 py-2 text-right font-medium text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items ?? []).map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-900">
                  {item.product_name}
                  {item.variant_name && (
                    <span className="text-gray-500 text-xs ml-1">({item.variant_name})</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  KES {(item.unit_price_kes / 100).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  KES {(item.total_kes / 100).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>KES {(order.subtotal_kes / 100).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>KES {(order.shipping_fee_kes / 100).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-1 mt-1">
            <span>Total</span>
            <span>KES {(order.total_kes / 100).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="font-medium text-gray-900 text-sm mb-3">Shipping address</h3>
        <div className="text-sm text-gray-700 space-y-0.5">
          <p className="font-medium">{order.shipping_name}</p>
          <p>{order.shipping_phone}</p>
          <p>{order.shipping_line_1}</p>
          {order.shipping_line_2 && <p>{order.shipping_line_2}</p>}
          <p>
            {order.shipping_city}
            {order.shipping_county ? `, ${order.shipping_county}` : ''}
          </p>
          <p>{order.shipping_country}</p>
        </div>
      </div>

    </div>
  );
}
