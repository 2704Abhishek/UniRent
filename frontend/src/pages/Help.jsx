export default function Help() {
  const customerIssues = [
    {
      issue: "I cannot rent an item",
      solution: "Check the card status first. If it says Item not available, someone has already rented it and new requests are blocked until it is returned."
    },
    {
      issue: "My payment is still pending",
      solution: "Open My Rentals, choose Items I Rented, and use Pay & Start Rental on the pending request."
    },
    {
      issue: "I rented an item but need to return it",
      solution: "Open Items I Rented and generate the return OTP. Share the return process with the owner so they can confirm the item return."
    },
    {
      issue: "I cannot find a listed item",
      solution: "Use the search bar in Rent an item and try category filters like Shirt, Laptop, Calculator, Phone Charger, or Other."
    },
    {
      issue: "The pickup place is unclear",
      solution: "Open the item detail page and check Collection address. If it is missing, contact the owner before sending the rental request."
    },
    {
      issue: "Wishlist item is no longer needed",
      solution: "Open Wishlist and press Remove on that item. It will disappear from your saved list immediately."
    },
    {
      issue: "My listed item shows On rent",
      solution: "That means a customer currently has an approved or active rental for it. It becomes available again after the return is confirmed."
    },
    {
      issue: "Deposit or refund confusion",
      solution: "Check My Rentals for refund status. Owners can refund or deduct deposits only after the item is marked returned."
    }
  ];

  return (
    <div className="page-shell">
      <section className="grid gap-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6">
          <p className="label">Help center</p>
          <h1 className="mt-1 text-3xl font-bold">Quick solutions for UniRent customers</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Find the common issue below and follow the matching solution before contacting support.
          </p>
        </div>
        <div className="grid content-center gap-3 bg-gradient-to-br from-blue-50 via-emerald-50 to-white p-6">
          <div className="rounded-md bg-white/90 p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Most common fix</p>
            <p className="mt-1 text-xl font-bold text-ink">Check item status before renting</p>
          </div>
          <div className="rounded-md bg-ink p-4 text-white shadow-sm">
            <p className="text-sm text-blue-100">Need faster help?</p>
            <p className="mt-1 font-semibold">Include item name, owner name, and rental status.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {customerIssues.map(({ issue, solution }) => (
          <article key={issue} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-soft">
            <p className="label">Issue</p>
            <h2 className="mt-1 text-lg font-bold text-ink">{issue}</h2>
            <p className="label mt-4 text-emerald-700">Solution</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{solution}</p>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900 shadow-sm">
        <p className="font-semibold">Still stuck?</p>
        <p className="mt-1">Contact the UniRent admin and include the item name, rental date, payment status, and a screenshot of the problem.</p>
      </section>
    </div>
  );
}
