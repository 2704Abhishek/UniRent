import { useEffect, useState } from "react";
import axios from "axios";
import PaymentButton from "../components/PaymentButton";
import RefundButton from "../components/RefundButton";
import DeductButton from "../components/DeductButton";

export default function Dashboard() {
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    const fetchRentals = async () => {
      const res = await axios.get("/rentals/my");
      setRentals(res.data);
    };
    fetchRentals();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Rentals</h1>
      {rentals.map((r) => (
        <div key={r._id} className="border p-4 mb-4 rounded shadow">
          <p><b>Item:</b> {r.item_id.title}</p>
          <p><b>Status:</b> {r.rental_status}</p>
          <p><b>Payment Status:</b> {r.payment_status}</p>
          <p><b>Refund Status:</b> {r.refund_status}</p>

          {r.payment_status === "pending" && (
            <PaymentButton rentalId={r._id} />
          )}

          {r.rental_status === "returned" && r.refund_status === "pending" && (
            <RefundButton rentalId={r._id} />
          )}

          {r.rental_status === "returned" && r.refund_status === "pending" && (
            <DeductButton rentalId={r._id} />
          )}
        </div>
      ))}
    </div>
  );
}
