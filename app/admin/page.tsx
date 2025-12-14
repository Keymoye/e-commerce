import { getDashboardMetrics } from "@/services/admin/metrics";
import MetricCard from "@/components/admin/dashboard/MetricCard";
import DashboardGrid from "@/components/admin/dashboard/DashboardGrid";
import { FaBox, FaUsers, FaShoppingCart } from "react-icons/fa";

export default async function AdminHomePage() {
  const metrics = await getDashboardMetrics();

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>

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
    </section>
  );
}
