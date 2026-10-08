import { useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { api, isPeak, priceFor, useClub } from 'club-store'
import { useMe } from '../lib/useMe'
import { useRun } from '../lib/useRun'
import Modal from './Modal'

interface Props {
  courtId: string
  date: string
  start: string
  onClose: () => void
}

export default function BookingModal({ courtId, date, start, onClose }: Props) {
  const me = useMe()
  const { run, busy } = useRun()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [query, setQuery] = useState('')
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [weeks, setWeeks] = useState(1)

  // Live data: if an admin changes the price while this is open, the summary follows.
  const info = useClub((s) => ({
    court: s.courts.find((c) => c.id === courtId),
    settings: s.settings,
    players: s.users.filter((u) => u.role === 'player' && u.active && u.id !== me.id),
    slotMinutes: s.settings.slotMinutes,
  }))
  const { court, settings } = info
  const partner = info.players.find((p) => p.id === partnerId)
  const matches = query.trim()
    ? info.players.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5)
    : []

  const peak = isPeak(settings, start)
  const perSession = priceFor(settings, start)
  const total = perSession * weeks
  const dates = Array.from({ length: weeks }, (_, i) => format(addDays(parseISO(date), 7 * i), 'MMM d'))
  const money = (n: number) => `${n} ${settings.currency}`
  const [h, m] = start.split(':').map(Number)
  const endMin = h * 60 + m + info.slotMinutes
  const end = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`

  const confirm = async () => {
    const input = { courtId, playerId: me.id, date, start, partnerId: partnerId ?? undefined }
    const result =
      weeks > 1
        ? await run(() => api.bookRecurring({ ...input, weeks }), `Weekly series booked (${weeks} sessions)`)
        : await run(() => api.bookReservation(input), 'Reservation confirmed')
    if (result.ok || result.code === 'SLOT_TAKEN') onClose()
  }

  return (
    <Modal title="Book court" testId="booking-modal" onClose={onClose}>
      <p data-testid="booking-step" data-step={step} className="mb-3 text-xs text-slate-500">
        Step {step} of 3
      </p>

      {step === 1 && (
        <div>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Court</dt><dd data-testid="booking-court">{court?.name} ({court?.surface})</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Date</dt><dd data-testid="booking-date">{format(parseISO(date), 'EEE, MMM d yyyy')}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Time</dt><dd data-testid="booking-time">{start} – {end}</dd></div>
          </dl>
          {peak && <p data-testid="booking-peak-note" className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-700">⚡ Peak hour pricing applies.</p>}
          <label htmlFor="repeat-weeks" className="mt-3 block text-sm font-medium">
            Repeat
          </label>
          <select
            id="repeat-weeks"
            data-testid="repeat-weeks"
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            className="mt-1 w-full rounded border bg-white px-3 py-2 text-sm"
          >
            <option value={1}>Just this once</option>
            {[2, 4, 6, 8].map((n) => (
              <option key={n} value={n}>Every week for {n} weeks</option>
            ))}
          </select>
          <div className="mt-4 flex justify-end">
            <button type="button" data-testid="booking-next" className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white" onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <label htmlFor="partner-search" className="mb-1 block text-sm font-medium">
            Playing with someone? (optional)
          </label>
          {partner ? (
            <div data-testid="partner-selected" className="flex items-center justify-between rounded border bg-green-50 p-2 text-sm">
              <span>{partner.name}</span>
              <button type="button" data-testid="partner-clear" className="text-xs text-slate-600 underline" onClick={() => setPartnerId(null)}>
                Remove
              </button>
            </div>
          ) : (
            <>
              <input
                id="partner-search"
                data-testid="partner-search"
                autoComplete="off"
                placeholder="Search players by name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
              {query.trim() && (
                <ul data-testid="partner-results" role="listbox" className="mt-1 rounded border bg-white">
                  {matches.length === 0 && <li data-testid="partner-no-results" className="p-2 text-sm text-slate-500">No players found</li>}
                  {matches.map((p) => (
                    <li key={p.id} role="option" aria-selected={false}>
                      <button
                        type="button"
                        data-testid={`partner-option-${p.id}`}
                        className="w-full p-2 text-left text-sm hover:bg-green-50"
                        onClick={() => {
                          setPartnerId(p.id)
                          setQuery('')
                        }}
                      >
                        {p.name} <span className="text-xs text-slate-500">level {p.level}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          <div className="mt-4 flex justify-between">
            <button type="button" data-testid="booking-back" className="rounded border px-4 py-2 text-sm" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" data-testid="booking-next" className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white" onClick={() => setStep(3)}>
              {partner ? 'Next' : 'Skip'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Court</dt><dd data-testid="summary-court">{court?.name}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">When</dt><dd data-testid="summary-when">{format(parseISO(date), 'MMM d')} · {start} – {end}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Partner</dt><dd data-testid="summary-partner">{partner?.name ?? 'None'}</dd></div>
            {weeks > 1 && (
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Weekly series</dt><dd data-testid="summary-series" className="text-right">{weeks} sessions: {dates.join(', ')}</dd></div>
            )}
          </dl>
          <div className="mt-3 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between"><span>Base price</span><span data-testid="summary-base">{money(settings.basePrice)}</span></div>
            {peak && (
              <div className="flex justify-between text-amber-700">
                <span>Peak surcharge</span>
                <span data-testid="summary-peak">+{money(settings.peakPrice - settings.basePrice)}</span>
              </div>
            )}
            {weeks > 1 && (
              <div className="flex justify-between"><span>Per session</span><span data-testid="summary-per-session">{money(perSession)} × {weeks}</span></div>
            )}
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span data-testid="summary-total">{money(total)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <button type="button" data-testid="booking-back" disabled={busy} className="rounded border px-4 py-2 text-sm disabled:opacity-50" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="button"
              data-testid="booking-confirm"
              disabled={busy}
              className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              onClick={confirm}
            >
              {busy ? 'Booking…' : 'Confirm booking'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
