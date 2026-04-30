import { useState } from "react";
import { api } from "../services/api";

export default function RentalRequestForm({ itemId }) {
  const [dates, setDates] = useState({ start: "", end: "" });
  const [message, setMessage] = useState("");

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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="label">Rental request</p>
        <h3 className="mt-1 text-xl font-bold">Request this item</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="date"
          className="field"
          onChange={(e) => setDates({ ...dates, start: e.target.value })}
        />
        <input
          type="date"
          className="field"
          onChange={(e) => setDates({ ...dates, end: e.target.value })}
        />
      </div>
      <button className="btn-primary">Request Rental</button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
