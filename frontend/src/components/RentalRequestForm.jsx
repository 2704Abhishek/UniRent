import { useState } from "react";
import { api } from "../services/api";

export default function RentalRequestForm({ itemId, item }) {
  const [dates, setDates] = useState({ start: "", end: "" });
  const [message, setMessage] = useState("");

  const rentalDays = (() => {
    if (!dates.start || !dates.end) return 1;
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return Number.isFinite(days) ? Math.max(days, 1) : 1;
  })();
  const rentTotal = Number(item?.pricePerDay || 0) * rentalDays;
  const deposit = Number(item?.depositAmount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/rentals", {
        item_id: itemId,
        start_date: dates.start,
        end_date: dates.end
      });
      setMessage("Rental request submitted.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <form id="rental-request" onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="label">Rental request</p>
        <h3 className="mt-1 text-xl font-bold">Choose dates and request rental</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your request will move through approval, payment, active rental, return OTP, and refund settlement.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="date"
          className="field"
          value={dates.start}
          onChange={(e) => setDates({ ...dates, start: e.target.value })}
          required
        />
        <input
          type="date"
          className="field"
          value={dates.end}
          onChange={(e) => setDates({ ...dates, end: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-3 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-slate-500">Rental days</p>
          <p className="font-bold text-ink">{rentalDays}</p>
        </div>
        <div>
          <p className="text-slate-500">Estimated rent</p>
          <p className="font-bold text-ink">Rs. {rentTotal.toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-slate-500">Deposit</p>
          <p className="font-bold text-ink">Rs. {deposit.toLocaleString("en-IN")}</p>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {["Request", "Owner approval", "Payment", "Active rental", "Return OTP", "Refund"].map((step) => (
          <span key={step} className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-campus">
            {step}
          </span>
        ))}
      </div>
      <button className="btn-primary">Request Rental</button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
