import Link from "next/link";
import type { ReactNode } from "react";

type LinkButtonProps = {
  href: string;
  label: string;
  icon: ReactNode;
  ariaLabel?: string;
  className?: string;
};

/** CTA de link externo (Educação, Certificações, Destaques): ícone discreto + texto sutil. */
export function LinkButton({
  href,
  label,
  icon,
  ariaLabel,
  className = "",
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={`group inline-flex items-center gap-2 ${className}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent-500/25 text-accent-300 transition-all group-hover:border-accent-500/50 group-hover:bg-accent-500/10 group-hover:text-accent-100">
        {icon}
      </span>
      <span className="text-[11px] font-normal text-neutral-500 transition-colors group-hover:text-neutral-300">
        {label}
      </span>
    </Link>
  );
}
