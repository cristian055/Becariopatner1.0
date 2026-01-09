import type { InputHTMLAttributes } from 'react'

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  error?: string
  helperText?: string
  'aria-label'?: string
}
