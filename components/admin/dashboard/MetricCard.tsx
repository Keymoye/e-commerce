import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  colorClass?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  colorClass = "bg-primary/10 text-primary",
}: MetricCardProps) {
  return (
    <div
      className={`flex items-center p-4 rounded-lg shadow-sm ${colorClass}`}
      role="region"
      aria-label={title}
    >
      {icon && <div className="mr-4">{icon}</div>}
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
