import { api } from "../services/api";

export default function RefundButton({ rentalId, onSuccess }) {
  const handleRefund = async () => {
    await api.post(`/payments/${rentalId}/refund`, {});
    onSuccess?.();
  };

  return (
    <button className="btn-secondary mt-2" onClick={handleRefund}>
      Refund Deposit
    </button>
  );
}
