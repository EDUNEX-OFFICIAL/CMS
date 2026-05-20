import type { ReactNode } from "react";

type AlertBannerProps = {
  variant: "error" | "warning" | "success";
  children: ReactNode;
};

const styles = {
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

export function AlertBanner({ variant, children }: AlertBannerProps) {
  return (
    <p
      className={`rounded-lg border p-3 text-sm ${styles[variant]}`}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
