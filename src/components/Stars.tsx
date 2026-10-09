/** Read-only rating: `rating` filled stars out of 5. The label is for screen readers; the stars are decoration. */
export default function Stars({ rating, testId }: { rating: number; testId: string }) {
  return (
    <span data-testid={testId} data-rating={rating} role="img" aria-label={`${rating} out of 5 stars`} className="text-amber-500">
      {'★'.repeat(rating)}
      <span className="text-slate-300">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}
