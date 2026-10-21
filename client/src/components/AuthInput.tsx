import { useState, type ChangeEvent } from 'react'

type AuthInputProps = {
  id: string
  name: string
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  showPasswordToggle?: boolean
  value: string
  onChange: (value: string) => void
  error?: string
}

export function AuthInput({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  showPasswordToggle = false,
  value,
  onChange,
  error,
}: AuthInputProps) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPasswordToggle ? (visible ? 'text' : 'password') : type
  const errorId = error ? `${id}-error` : undefined

  const inputClassName = `w-full rounded-lg border bg-(--bg) px-4 py-3 text-sm outline-none placeholder:text-(--text-muted) ${
    error
      ? 'border-(--danger) focus:border-(--danger)'
      : 'border-(--border) focus:border-(--accent)'
  }`

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const input = showPasswordToggle && isPassword ? (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={inputType}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputClassName} pr-14`}
        value={value}
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
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
      value={value}
      onChange={handleChange}
      aria-invalid={error ? true : undefined}
      aria-describedby={errorId}
    />
  )

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-(--text)">
        {label}
      </label>

      {input}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-[13px] text-(--danger)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  )
}
