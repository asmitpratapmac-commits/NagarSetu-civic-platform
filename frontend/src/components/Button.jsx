import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
};

export const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon: Icon,
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={`${VARIANT_CLASS[variant]} ${className}`}
    disabled={isLoading || rest.disabled}
    {...rest}
  >
    {isLoading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
    {children}
  </button>
);
