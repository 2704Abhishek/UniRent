import { useState } from "react";
import { api } from "../services/api";

export default function RefundButton({ rentalId, onSuccess }) {
  const [message, setMessage] = useState("");

  const handleRefund = async () => {
    try {
      setMessage("");
      const data = await api.post(`/payments/${rentalId}/refund`, {});
      const refundStatus = data.refund?.status ? ` Razorpay status: ${data.refund.status}.` : "";
      setMessage(`Deposit refund initiated.${refundStatus}`);
      onSuccess?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="mt-2">
      <button className="btn-secondary" onClick={handleRefund}>
        Refund Deposit
      </button>
      {message ? <p className="mt-2 text-sm font-medium text-slate-600">{message}</p> : null}
    </div>
  );
}
