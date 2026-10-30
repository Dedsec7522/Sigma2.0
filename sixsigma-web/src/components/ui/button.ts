// Button styles shared by <Link>, <a> and <button>. One primary action per view.
type Variant = "primary" | "secondary" | "ghost" | "gold" | "outline-light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold tracking-[-0.005em] " +
  "transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-navy-900 text-white hover:bg-navy-700 shadow-[0_6px_20px_-8px_rgb(11_29_58/0.6)]",
  gold: "bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-[0_8px_24px_-10px_rgb(242_194_48/0.8)]",
  secondary: "bg-white text-navy-900 ring-1 ring-inset ring-line-strong hover:ring-navy-700 hover:bg-navy-50",
  ghost: "text-navy-900 hover:bg-navy-50",
  "outline-light": "text-white ring-1 ring-inset ring-white/35 hover:bg-white/10 hover:ring-white/60",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.95rem]",
  lg: "h-14 px-7 text-base",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md", extra = "") =>
  `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
