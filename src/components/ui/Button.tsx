import React, { ButtonHTMLAttributes, forwardRef } from 'react';

// Common classes that apply to all variants
const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95";

const variantStyles = {
  // The exact style requested by the user from Navbar.tsx
  primary: "text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-100",
  // Common secondary/outline style
  secondary: "text-slate-700 bg-white border border-gray-200 hover:bg-slate-50",
  // Common danger style
  danger: "text-red-600 bg-white border border-red-200 hover:bg-red-50",
  // Ghost variant (no border, no bg unless hovered)
  ghost: "text-slate-700 hover:bg-slate-50 hover:text-blue-600 border border-transparent",
  // Dark/black variant
  dark: "text-white bg-slate-900 hover:bg-black shadow-lg",
};

const sizeStyles = {
  sm: "px-4 py-1.5 text-sm rounded-lg",
  // The exact sizing requested by the user from Navbar.tsx
  md: "px-6 py-2 text-[15px] rounded-xl", 
  lg: "px-10 py-4 text-base rounded-2xl",
  icon: "p-2 rounded-lg", // specific for icon-only buttons
  iconLg: "w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    // Combine base classes, variant classes, size classes, and any custom overrides
    const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();
    
    // Quick dedup of classes (optional, but handles things like multiple rounded classes gracefully if user overrides)
    // We let tailwind's natural CSS cascade take care of most things.

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
