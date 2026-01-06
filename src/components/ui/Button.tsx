"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export default function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50",
        {
          "bg-black text-white hover:bg-gray-800 focus:ring-black":
            variant === "primary",
          "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300":
            variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600":
            variant === "danger",
        },
        className
      )}
    />
  );
}
