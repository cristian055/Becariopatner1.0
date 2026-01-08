import type { InputHTMLAttributes } from 'react';

export type InputType = 'text' | 'email' | 'number' | 'tel' | 'password' | 'date' | 'time';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ComponentType<{ size?: number }>;
  'aria-label'?: string;
}
