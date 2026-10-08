export default function Rules() {
  return (
    <section data-testid="rules-page">
      <h2 className="mb-3 text-xl font-semibold">Club rules</h2>
      <iframe
        title="Club rules"
        data-testid="rules-iframe"
        src={`${import.meta.env.BASE_URL}club-rules.html`}
        className="h-[70vh] w-full rounded-lg border bg-white"
      />
    </section>
  )
}
