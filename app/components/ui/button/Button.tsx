import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'rounded-lg font-medium cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-green-500 text-white hover:bg-green-600',
        outline: 'bg-transparent border border-green-500 text-green-500 hover:bg-green-50',
        ghost:   'bg-transparent text-green-500 hover:bg-green-50',
        danger:  'bg-red-500 text-white hover:bg-red-600',
        icon:    'bg-transparent hover:bg-gray-100 text-gray-600',
      },
      size: {
        sm:   'px-3 py-1 text-sm',
        md:   'px-4 py-2 text-base',
        lg:   'px-6 py-3 text-lg',
        icon: 'p-2',
      },
      fullWidth: {
        true: 'w-full',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    }
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  label?: string
  isLoading?: boolean
  icon?: React.ReactNode
  iconOnly?: boolean
}

const Button = ({
  label,
  variant,
  size,
  fullWidth,
  isLoading,
  className,
  children,
  disabled,
  icon,
  iconOnly,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size: iconOnly ? 'icon' : size, fullWidth }),
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading...
        </span>
      ) : iconOnly ? (
        // hanya tampilkan icon
        icon
      ) : icon ? (
        // icon + label
        <span className="flex items-center gap-2">
          {icon}
          {label ?? children}
        </span>
      ) : (
        label ?? children
      )}
    </button>
  )
}

export default Button