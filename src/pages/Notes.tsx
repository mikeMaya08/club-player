import { format, parseISO } from 'date-fns'
import { useClub } from 'club-store'
import Stars from '../components/Stars'
import { sanitizeHtml } from '../lib/sanitize'
import { useMe } from '../lib/useMe'

export default function Notes() {
  const me = useMe()
  const data = useClub((s) => ({
    notes: s.notes.filter((n) => n.playerId === me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    coaches: Object.fromEntries(s.users.map((u) => [u.id, u.name])),
  }))

  return (
    <section data-testid="notes-page">
      <h2 className="mb-3 text-xl font-semibold">My notes</h2>
      {data.notes.length === 0 && (
        <p data-testid="notes-empty" className="rounded-lg border bg-white p-6 text-center text-sm text-slate-500">
          Your coaches have not left any notes yet.
        </p>
      )}
      <ul className="space-y-2">
        {data.notes.map((n) => (
          <li key={n.id} data-testid={`note-${n.id}`} className="rounded-lg border bg-white p-3">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span data-testid={`note-coach-${n.id}`} className="font-medium">
                {data.coaches[n.coachId]}
              </span>
              <Stars rating={n.rating} testId={`note-rating-${n.id}`} />
            </div>
            <p data-testid={`note-date-${n.id}`} className="mb-2 text-xs text-slate-500">
              {format(parseISO(n.createdAt), 'MMM d, yyyy')}
            </p>
            <div
              data-testid={`note-text-${n.id}`}
              className="prose-sm text-sm [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(n.text) }}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
