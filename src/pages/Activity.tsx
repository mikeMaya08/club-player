import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { filterEvents, useClub } from 'club-store'
import { useMe } from '../lib/useMe'

const FILTERS = [
  { id: 'all', label: 'All', prefixes: [] as string[] },
  { id: 'reservations', label: 'Reservations', prefixes: ['reservation.'] },
  { id: 'lessons', label: 'Lessons', prefixes: ['lesson.', 'attendance.'] },
]
const PAGE = 15

const icon = (type: string) =>
  type.startsWith('reservation.') ? '🎾' : type.startsWith('lesson.') || type.startsWith('attendance.') ? '📚' : type.startsWith('note.') ? '📝' : '•'

export default function Activity() {
  const me = useMe()
  const [filter, setFilter] = useState('all')
  const [visible, setVisible] = useState(PAGE)
  const mine = useClub((s) => filterEvents(s.events, { involvingUserId: me.id }))

  const prefixes = FILTERS.find((f) => f.id === filter)!.prefixes
  const list = mine.filter((e) => prefixes.length === 0 || prefixes.some((p) => e.type.startsWith(p)))

  return (
    <section data-testid="activity-page">
      <h2 className="mb-3 text-xl font-semibold">My activity</h2>
      <div role="group" aria-label="Filter activity" className="mb-3 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            data-testid={`activity-filter-${f.id}`}
            aria-pressed={filter === f.id}
            className={`rounded-full border px-3 py-1.5 text-sm ${filter === f.id ? 'border-green-700 bg-green-700 text-white' : 'bg-white'}`}
            onClick={() => {
              setFilter(f.id)
              setVisible(PAGE)
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p data-testid="activity-empty" className="rounded-lg border bg-white p-6 text-center text-sm text-slate-500">
          Nothing here yet. Your bookings and lessons will show up as you use the club.
        </p>
      )}

      <ol data-testid="activity-list" className="space-y-2">
        {list.slice(0, visible).map((e) => (
          <li key={e.id} data-testid={`event-${e.id}`} data-type={e.type} className="flex gap-3 rounded-lg border bg-white p-3">
            <span aria-hidden className="text-lg">{icon(e.type)}</span>
            <div>
              <p data-testid={`event-summary-${e.id}`} className="text-sm">{e.summary}</p>
              <p data-testid={`event-time-${e.id}`} className="text-xs text-slate-500">{format(parseISO(e.createdAt), 'MMM d, HH:mm')}</p>
            </div>
          </li>
        ))}
      </ol>

      {list.length > visible && (
        <div className="mt-3 text-center">
          <button type="button" data-testid="activity-more" className="rounded border bg-white px-4 py-2 text-sm" onClick={() => setVisible((v) => v + PAGE)}>
            Show more ({list.length - visible} left)
          </button>
        </div>
      )}
    </section>
  )
}
