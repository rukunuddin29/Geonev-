import { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  right?: ReactNode;
}

export default function AuthField({
  label,
  icon: Icon,
  right,
  className = "",
  ...inputProps
}: AuthFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          {...inputProps}
          className={`w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 ${className}`}
        />

        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {right}
          </div>
        )}
      </div>
    </label>
  );
}