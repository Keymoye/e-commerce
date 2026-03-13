import { getDashboardMetrics } from "@/services/admin/metrics";
import MetricCard from "@/components/admin/dashboard/MetricCard";
import DashboardGrid from "@/components/admin/dashboard/DashboardGrid";
import { FaBox, FaUsers, FaShoppingCart } from "react-icons/fa";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

function AdminFallback() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center my-8">
      <p className="font-medium text-red-700">Failed to load admin dashboard.</p>
      <p className="text-sm text-red-500 mt-1">Please refresh the page to try again.</p>
    </div>
  );
}

export default async function AdminHomePage() {
  const metrics = await getDashboardMetrics();

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>

      <ErrorBoundary fallback={<AdminFallback />}>
        <DashboardGrid>
          <MetricCard
            title="Products"
            value={metrics.totalProducts}
            icon={<FaBox size={24} />}
          />
          <MetricCard
            title="Users"
            value={metrics.totalUsers}
            icon={<FaUsers size={24} />}
          />
          <MetricCard
            title="Orders"
            value={metrics.totalOrders}
            icon={<FaShoppingCart size={24} />}
          />
          <MetricCard
            title="Revenue"
            value="$0.00"
            icon={<FaShoppingCart size={24} />}
          />
        </DashboardGrid>
      </ErrorBoundary>
    </section>
  );
}
