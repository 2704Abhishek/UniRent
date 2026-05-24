import { Link } from "react-router-dom";

export default function CheckoutInfo() {
  const steps = [
    {
      title: "Choose an item",
      body: "Customers browse product listings, open an item page, and review rent per day, deposit, condition, pickup details, and owner information."
    },
    {
      title: "Request rental dates",
      body: "After signing in, the customer selects start and end dates. UniRent calculates rent for the selected days and adds the refundable deposit."
    },
    {
      title: "Owner approval",
      body: "The owner approves the request before payment. This helps avoid collecting money for unavailable or unsuitable rentals."
    },
    {
      title: "Pay through checkout",
      body: "The customer pays rent plus refundable deposit using Razorpay checkout. UniRent verifies the payment before activating the rental."
    },
    {
      title: "Return and refund",
      body: "After item return is confirmed through OTP, the owner can refund the deposit or deduct eligible charges for damage or late return."
    }
  ];

  return (
    <div className="page-shell">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <p className="label">Checkout flow</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Single-item rental checkout</h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          UniRent does not use a multi-item shopping cart because each rental has its own dates, owner approval, pickup details, rent, and deposit.
          Customers complete checkout for one approved rental at a time.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link className="btn-primary" to="/home">Browse product listings</Link>
          <Link className="btn-secondary" to="/refund-policy">Read refund policy</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step, index) => (
          <article key={step.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="label">Step {index + 1}</p>
            <h2 className="mt-1 text-lg font-bold text-ink">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-950 shadow-sm">
        <p className="font-bold">Payment amount shown before checkout</p>
        <p className="mt-1">
          The customer can see rent amount, deposit amount, and total payable before clicking Pay & Start Rental.
        </p>
      </section>
    </div>
  );
}
