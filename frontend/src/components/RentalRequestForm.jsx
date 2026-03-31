import { useState } from "react";
import axios from "axios";

export default function RentalRequestForm({ itemId }) {
  const [dates, setDates] = useState({ start: "", end: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/rentals", { item_id: itemId, start_date: dates.start, end_date: dates.end });
    alert("Rental request submitted!");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input type="date" onChange={(e) => setDates({ ...dates, start: e.target.value })} />
      <input type="date" onChange={(e) => setDates({ ...dates, end: e.target.value })} />
      <button className="bg-green-500 text-white px-4 py-2 ml-2">Request Rental</button>
    </form>
  );
}
