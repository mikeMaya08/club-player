import type { ReactNode } from 'react'

/** Shows `text` on hover or keyboard focus. Works around disabled buttons not firing hover events. */
export default function Tooltip({ text, testId, children }: { text: string | null; testId: string; children: ReactNode }) {
  if (!text) return <>{children}</>
  return (
    <span className="group relative inline-block" title={text} tabIndex={0}>
      {children}
      <span
        role="tooltip"
        data-testid={testId}
        className="pointer-events-none absolute bottom-full right-0 z-20 mb-1 hidden w-48 rounded bg-slate-800 px-2 py-1 text-xs text-white group-hover:block group-focus:block"
      >
        {text}
      </span>
    </span>
  )
}
