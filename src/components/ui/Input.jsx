import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = "text",
  error,
  className = "",
  ...props
}, ref) => {
  return (
    <div className="flex flex-col w-full gap-1.5 mb-4">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          form-input
          bg-white
          text-slate-900 placeholder:text-slate-500
          hover:border-slate-400
          ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="form-error">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;