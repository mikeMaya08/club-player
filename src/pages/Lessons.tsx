import { format, parseISO } from 'date-fns'
import { api, at, clock, useClub } from 'club-store'
import { useMe } from '../lib/useMe'
import { useRun } from '../lib/useRun'

export default function Lessons() {
  const me = useMe()
  const { run, busy } = useRun()
  const data = useClub((s) => {
    const now = clock.now()
    return {
      lessons: s.lessons
        .filter((l) => l.status === 'scheduled' && at(l.date, l.end) > now)
        .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)),
      users: Object.fromEntries(s.users.map((u) => [u.id, u.name])),
      courts: Object.fromEntries(s.courts.map((c) => [c.id, c.name])),
    }
  })

  return (
    <section data-testid="lessons-page">
      <h2 className="mb-3 text-xl font-semibold">Lessons</h2>
      {data.lessons.length === 0 && (
        <p data-testid="lessons-empty" className="rounded-lg border bg-white p-6 text-center text-sm text-slate-500">
          No upcoming lessons.
        </p>
      )}
      <ul className="space-y-2">
        {data.lessons.map((l) => {
          const left = l.capacity - l.studentIds.length
          const enrolled = l.studentIds.includes(me.id)
          const full = left <= 0
          const position = l.waitlist.indexOf(me.id) + 1
          return (
            <li key={l.id} data-testid={`lesson-${l.id}`} className="rounded-lg border bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p data-testid={`lesson-title-${l.id}`} className="font-medium">{l.title}</p>
                  <p data-testid={`lesson-when-${l.id}`} className="text-sm text-slate-600">
                    {format(parseISO(l.date), 'EEE, MMM d')} · {l.start} – {l.end}
                  </p>
                  <p data-testid={`lesson-info-${l.id}`} className="text-xs text-slate-500">
                    Coach {data.users[l.coachId]} · {data.courts[l.courtId]}
                  </p>
                </div>
                <span
                  data-testid={`lesson-seats-${l.id}`}
                  data-seats-left={Math.max(left, 0)}
                  className={`rounded px-2 py-0.5 text-xs font-medium ${full ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                >
                  {full ? 'Full' : `${left} seat${left === 1 ? '' : 's'} left`}
                </span>
              </div>
              {position > 0 && (
                <p data-testid={`lesson-waitlist-pos-${l.id}`} className="mt-2 text-sm text-amber-700">
                  You are #{position} on the waitlist. We will enroll you automatically if a seat opens up.
                </p>
              )}
              <div className="mt-2 flex flex-wrap justify-end gap-2">
                {!enrolled && full && position === 0 && (
                  <button
                    type="button"
                    data-testid={`lesson-waitlist-join-${l.id}`}
                    disabled={busy}
                    className="rounded border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 disabled:opacity-60"
                    onClick={() => run(() => api.joinWaitlist(l.id, me.id), 'You are on the waitlist')}
                  >
                    Join waitlist
                  </button>
                )}
                {position > 0 && (
                  <button
                    type="button"
                    data-testid={`lesson-waitlist-leave-${l.id}`}
                    disabled={busy}
                    className="rounded border px-3 py-1.5 text-sm disabled:opacity-60"
                    onClick={() => run(() => api.leaveWaitlist(l.id, me.id), 'You left the waitlist')}
                  >
                    Leave waitlist
                  </button>
                )}
                {enrolled ? (
                  <button
                    type="button"
                    data-testid={`lesson-leave-${l.id}`}
                    disabled={busy}
                    className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-60"
                    onClick={() => run(() => api.leaveLesson(l.id, me.id), 'You left the lesson')}
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid={`lesson-enroll-${l.id}`}
                    disabled={busy || full}
                    className="rounded bg-green-700 px-3 py-1.5 text-sm font-medium text-white disabled:bg-slate-300 disabled:text-slate-600"
                    onClick={() => run(() => api.enrollInLesson(l.id, me.id), 'You are enrolled')}
                  >
                    {full ? 'Full' : 'Enroll'}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
