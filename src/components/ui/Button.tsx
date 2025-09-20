"use client";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "solid",
  size = "md",
  children,
  ...props
}) => {
  const sizeCls =
    size === "sm"
      ? "h-9 text-sm px-3"
      : size === "lg"
      ? "h-12 text-base px-6"
      : "h-11 text-sm px-5";

  const variantCls =
    variant === "outline"
      ? "btn outline"
      : variant === "ghost"
      ? "btn ghost"
      : "btn";

  return (
    <button className={`${variantCls} ${sizeCls} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
