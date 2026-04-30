import { api } from "../services/api";

export default function DeductButton({ rentalId, onSuccess }) {
  const handleDeduct = async () => {
    await api.post(`/payments/${rentalId}/deduct`, { deduction_amount: 500 });
    onSuccess?.();
  };

  return (
    <button className="btn-danger mt-2" onClick={handleDeduct}>
      Deduct Deposit
    </button>
  );
}
