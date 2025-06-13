import { ReactNode } from "react";

export function PageCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101522]">
      <div
        className={`w-full max-w-md p-8 bg-[#181c2a] rounded-xl shadow border border-[#23263a] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
