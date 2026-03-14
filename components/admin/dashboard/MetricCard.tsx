import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
}

export default function MetricCard({
  title,
  value,
  icon,
}: MetricCardProps) {
  return (
    <div
      className="flex items-center p-6 rounded-lg border border-gray-200 bg-white shadow-sm"
      role="region"
      aria-label={title}
    >
      {icon && (
        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
