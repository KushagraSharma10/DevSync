import { useState } from 'react'

type AuthInputProps = {
  id: string
  name: string
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  showPasswordToggle?: boolean
}

const inputClassName =
  'w-full rounded-lg border border-(--border) bg-(--bg) px-4 py-3 text-sm outline-none placeholder:text-(--text-muted) focus:border-(--accent)'

export function AuthInput({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  showPasswordToggle = false,
}: AuthInputProps) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPasswordToggle ? (visible ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-(--text)">
        {label}
      </label>

      {showPasswordToggle && isPassword ? (
        <div className="relative">
          <input
            id={id}
            name={name}
            type={inputType}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`${inputClassName} pr-14`}
          />
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-(--text-muted) hover:text-(--accent)"
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
      ) : (
        <input
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputClassName}
        />
      )}
    </div>
  )
}
