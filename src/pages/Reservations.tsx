import { useEffect, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { api, at, clock, hasBug, hoursUntil, useClub, type Reservation } from 'club-store'
import Modal from '../components/Modal'
import Tooltip from '../components/Tooltip'
import { useMe } from '../lib/useMe'
import { useRun } from '../lib/useRun'

const PAGE = 10
const STATUS_STYLE: Record<Reservation['status'], string> = {
  booked: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-600',
}

export default function Reservations() {
  const me = useMe()
  const { run, busy } = useRun()
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming')
  const [visible, setVisible] = useState(PAGE)
  const [toCancel, setToCancel] = useState<Reservation | null>(null)
  const sentinel = useRef<HTMLDivElement>(null)

  const data = useClub((s) => {
    const now = clock.now()
    const mine = s.reservations.filter((r) => r.playerId === me.id || r.partnerId === me.id)
    const key = (r: Reservation) => r.date + r.start
    return {
      upcoming: mine.filter((r) => r.status === 'booked' && at(r.date, r.start) > now).sort((a, b) => key(a).localeCompare(key(b))),
      history: mine.filter((r) => !(r.status === 'booked' && at(r.date, r.start) > now)).sort((a, b) => key(b).localeCompare(key(a))),
      courts: Object.fromEntries(s.courts.map((c) => [c.id, c.name])),
      users: Object.fromEntries(s.users.map((u) => [u.id, u.name])),
      limit: s.settings.cancelHoursLimit,
      currency: s.settings.currency,
    }
  })

  // Infinite scroll for History.
  useEffect(() => {
    if (tab !== 'history' || !sentinel.current) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible((v) => v + PAGE)
    })
    observer.observe(sentinel.current)
    return () => observer.disconnect()
  }, [tab, data.history.length])

  const list = tab === 'upcoming' ? data.upcoming : data.history.slice(0, visible)

  const cancelNote = (r: Reservation) => {
    if (hasBug('cancel-anytime')) return null
    return hoursUntil(r.date, r.start, clock.now()) < data.limit
      ? `Too late to cancel: reservations close ${data.limit} hours before the start.`
      : null
  }

  return (
    <section data-testid="reservations-page">
      <h2 className="mb-3 text-xl font-semibold">My reservations</h2>
      <div role="tablist" className="mb-3 flex gap-1 rounded-lg bg-slate-200 p-1">
        {(['upcoming', 'history'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            data-testid={`tab-${t}`}
            className={`flex-1 rounded-md py-2 text-sm font-medium ${tab === t ? 'bg-white shadow' : 'text-slate-600'}`}
            onClick={() => {
              setTab(t)
              setVisible(PAGE)
            }}
          >
            {t === 'upcoming' ? `Upcoming (${data.upcoming.length})` : `History (${data.history.length})`}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p data-testid={`${tab}-empty`} className="rounded-lg border bg-white p-6 text-center text-sm text-slate-500">
          {tab === 'upcoming' ? 'No upcoming reservations.' : 'No past reservations.'}
        </p>
      )}

      <ul data-testid={`${tab}-list`} className="space-y-2">
        {list.map((r) => {
          const note = cancelNote(r)
          return (
            <li key={r.id} data-testid={`reservation-${r.id}`} data-status={r.status} className="rounded-lg border bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p data-testid={`reservation-court-${r.id}`} className="font-medium">
                    {data.courts[r.courtId] ?? r.courtId}
                  </p>
                  <p data-testid={`reservation-when-${r.id}`} className="text-sm text-slate-600">
                    {format(parseISO(r.date), 'EEE, MMM d')} · {r.start} – {r.end}
                  </p>
                  {r.partnerId && (
                    <p data-testid={`reservation-partner-${r.id}`} className="text-xs text-slate-500">
                      {r.playerId === me.id ? `With ${data.users[r.partnerId]}` : `Booked by ${data.users[r.playerId]}`}
                    </p>
                  )}
                  {r.cancelReason && (
                    <p data-testid={`reservation-reason-${r.id}`} className="text-xs text-red-600">
                      {r.cancelReason}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span data-testid={`reservation-status-${r.id}`} className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                    {r.status}
                  </span>
                  <p data-testid={`reservation-price-${r.id}`} className="mt-1 text-sm">
                    {r.price} {data.currency}
                  </p>
                </div>
              </div>
              {tab === 'upcoming' && (
                <div className="mt-2 flex justify-end">
                  <Tooltip text={note} testId={`cancel-tooltip-${r.id}`}>
                    <button
                      type="button"
                      data-testid={`cancel-btn-${r.id}`}
                      disabled={note !== null}
                      className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:border-slate-200 disabled:text-slate-400"
                      onClick={() => setToCancel(r)}
                    >
                      Cancel
                    </button>
                  </Tooltip>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {tab === 'history' && (
        <>
          <div ref={sentinel} data-testid="history-sentinel" className="h-8" />
          <p data-testid="history-count" className="text-center text-xs text-slate-400">
            Showing {Math.min(visible, data.history.length)} of {data.history.length}
          </p>
        </>
      )}

      {toCancel && (
        <Modal title="Cancel reservation?" testId="cancel-dialog" onClose={() => setToCancel(null)}>
          <p data-testid="cancel-dialog-text" className="text-sm text-slate-600">
            {data.courts[toCancel.courtId]} on {format(parseISO(toCancel.date), 'MMM d')} at {toCancel.start} will be released.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" data-testid="cancel-dismiss" className="rounded border px-4 py-2 text-sm" onClick={() => setToCancel(null)}>
              Keep it
            </button>
            <button
              type="button"
              data-testid="cancel-confirm"
              disabled={busy}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              onClick={async () => {
                const result = await run(() => api.cancelReservation(toCancel.id, me.id), 'Reservation cancelled')
                if (result.ok || result.code) setToCancel(null)
              }}
            >
              {busy ? 'Cancelling…' : 'Yes, cancel'}
            </button>
          </div>
        </Modal>
      )}
    </section>
  )
}
