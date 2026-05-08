export default function Help() {
  return (
    <div className="page-shell">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <p className="label">Help center</p>
        <h1 className="mt-1 text-3xl font-bold">Need help with UniRent?</h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          Use this section when you are unsure about renting, listing, pickup, deposits, or returns.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Renting an item", "Search or filter items, open the item page, choose dates, and submit your rental request."],
          ["Listing an item", "Add a photo, category, rent price, deposit, and the pickup address where the customer can collect it."],
          ["Wishlist", "Save items while browsing and remove them later from the wishlist if you change your mind."],
          ["Pickup and return", "Check the item address before requesting. Return OTPs help confirm the item came back safely."]
        ].map(([title, text]) => (
          <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-soft">
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
        <p className="font-semibold">Still stuck?</p>
        <p className="mt-1">Contact the UniRent admin from your campus support desk and include the item name or rental request details.</p>
      </section>
    </div>
  );
}
