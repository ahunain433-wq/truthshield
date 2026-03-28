import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  isLoading = false,
}) => {
  // Variant styles
  const variants = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    outline: "btn btn-outline",
    danger:
      "btn btn-danger bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-red-500/25",
  };

  // Size styles
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
