import * as React from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
  suffix?: string
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, suffix = "VNĐ", className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, '')
      const numValue = rawValue ? parseInt(rawValue, 10) : 0
      onChange(numValue)
    }

    const displayValue = value > 0 ? new Intl.NumberFormat('vi-VN').format(value) : ''

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          inputMode="numeric"
          className={cn("pr-14", className)}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    )
  }
)
MoneyInput.displayName = "MoneyInput"

export { MoneyInput }
