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
      className="flex items-center p-6 rounded-lg border border-border bg-card shadow-sm"
      role="region"
      aria-label={title}
    >
      {icon && (
        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
