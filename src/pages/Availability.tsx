import { useEffect, useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { clock, hasBug, isPeak, slotStatus, slotsFor, useClub, useConfig, type SlotStatus } from 'club-store'
import BookingModal from '../components/BookingModal'

const STATE_STYLE: Record<SlotStatus, string> = {
  available: 'bg-green-100 text-green-800 hover:bg-green-200',
  taken: 'bg-red-100 text-red-700',
  blocked: 'bg-slate-300 text-slate-700',
  lesson: 'bg-purple-100 text-purple-700',
  'no-lights': 'bg-slate-800 text-amber-200',
  past: 'bg-slate-100 text-slate-600',
  inactive: 'bg-slate-100 text-slate-600',
}

const STATE_LABEL: Record<SlotStatus, string> = {
  available: 'Free',
  taken: 'Taken',
  blocked: 'Blocked',
  lesson: 'Lesson',
  'no-lights': 'No lights',
  past: 'Past',
  inactive: 'Closed',
}

/** `?bug=slow-render` holds the grid back for 3 seconds every time the date changes. */
function useSlowRender(key: string) {
  const { bugs } = useConfig()
  const slow = bugs.includes('slow-render')
  const [readyKey, setReadyKey] = useState<string | null>(null)
  useEffect(() => {
    if (!slow) return
    const timer = setTimeout(() => setReadyKey(key), 3000)
    return () => clearTimeout(timer)
  }, [slow, key])
  return !slow || readyKey === key
}

/** Court x hour grid for one day. Each cell comes from `slotStatus`, the same rules the store enforces when booking. */
export default function Availability() {
  const [date, setDate] = useState(() => clock.today())
  const [selected, setSelected] = useState<{ courtId: string; start: string } | null>(null)
  const ready = useSlowRender(date)

  // The grid is computed inside the selector so it refreshes when any tab changes the data or the clock.
  const grid = useClub((s) => {
    const now = clock.now()
    const slots = slotsFor(s.settings)
    return {
      courts: s.courts,
      slots: slots.map((slot) => ({ ...slot, peak: isPeak(s.settings, slot.start) })),
      status: Object.fromEntries(
        s.courts.flatMap((c) => slots.map((slot) => [`${c.id}|${slot.start}`, slotStatus(s, c.id, date, slot.start, now)])),
      ) as Record<string, SlotStatus>,
    }
  })

  const shift = (days: number) => setDate((d) => format(addDays(parseISO(d), days), 'yyyy-MM-dd'))

  return (
    <section data-testid="availability-page">
      <h2 className="mb-3 text-xl font-semibold">Book a court</h2>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" data-testid="date-prev" aria-label="Previous day" className="rounded border bg-white px-3 py-2" onClick={() => shift(-1)}>
          ‹
        </button>
        <input
          type="date"
          data-testid="date-input"
          aria-label="Date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="rounded border bg-white px-3 py-2 text-sm"
        />
        <button type="button" data-testid="date-next" aria-label="Next day" className="rounded border bg-white px-3 py-2" onClick={() => shift(1)}>
          ›
        </button>
        <button type="button" data-testid="date-today" className="rounded border bg-white px-3 py-2 text-sm" onClick={() => setDate(clock.today())}>
          Today
        </button>
        <span data-testid="date-label" className="text-sm text-slate-600">
          {format(parseISO(date), 'EEEE, MMM d')}
        </span>
      </div>

      <ul data-testid="grid-legend" className="mb-3 flex flex-wrap gap-2 text-xs">
        {(Object.keys(STATE_LABEL) as SlotStatus[]).map((st) => (
          <li key={st} data-testid={`legend-${st}`} className={`rounded px-2 py-1 ${STATE_STYLE[st]}`}>
            {STATE_LABEL[st]}
          </li>
        ))}
        <li data-testid="legend-peak" className="rounded border border-amber-400 bg-amber-50 px-2 py-1 text-amber-700">
          ⚡ Peak
        </li>
      </ul>

      {!ready ? (
        <div data-testid="grid-loading" role="status" className="rounded-lg border bg-white p-8 text-center text-slate-500">
          Loading availability…
        </div>
      ) : (
        <div data-testid="availability-grid" className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white p-2 text-left text-xs text-slate-500">Time</th>
                {grid.courts.map((c) => (
                  <th key={c.id} data-testid={`court-header-${c.id}`} className="p-2 text-center">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs font-normal text-slate-500">
                      {c.surface} · {c.lights ? 'lights' : 'no lights'}
                      {!c.active && ' · closed'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.slots.map((slot) => (
                <tr key={slot.start} data-testid={`row-${slot.start}`} className="border-t">
                  <th
                    scope="row"
                    data-testid={`time-${slot.start}`}
                    className={`sticky left-0 z-10 p-2 text-left text-xs font-medium ${slot.peak ? 'bg-amber-50 text-amber-700' : 'bg-white text-slate-600'}`}
                  >
                    {slot.start}
                    {slot.peak && <span aria-label="peak"> ⚡</span>}
                  </th>
                  {grid.courts.map((c) => {
                    const status = grid.status[`${c.id}|${slot.start}`]
                    const clickable = status === 'available'
                    return (
                      <td key={c.id} className="p-1">
                        <button
                          type="button"
                          data-testid={`slot-${c.id}-${slot.start}`}
                          data-state={status}
                          data-peak={slot.peak}
                          disabled={!clickable}
                          aria-label={`${c.name} ${slot.start} ${STATE_LABEL[status]}${slot.peak ? ' (peak)' : ''}`}
                          className={`h-11 w-full rounded text-xs font-medium ${STATE_STYLE[status]} ${slot.peak && clickable ? 'ring-1 ring-amber-400' : ''}`}
                          onClick={() => setSelected({ courtId: c.id, start: slot.start })}
                        >
                          {STATE_LABEL[status]}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <BookingModal date={date} courtId={selected.courtId} start={selected.start} onClose={() => setSelected(null)} />}
      {hasBug('slow-render') && <p className="mt-2 text-xs text-slate-500">slow-render bug active</p>}
    </section>
  )
}
