import { api } from "../services/api";

export default function PaymentButton({ rentalId, onSuccess }) {
  const handlePayment = async () => {
    await api.post(`/payments/${rentalId}/initiate`, {});
    onSuccess?.();
  };

  return (
    <button className="btn-primary mt-2" onClick={handlePayment}>
      Pay & Start Rental
    </button>
  );
}
