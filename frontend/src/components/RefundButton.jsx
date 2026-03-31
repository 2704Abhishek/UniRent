import axios from "axios";

export default function RefundButton({ rentalId }) {
  const handleRefund = async () => {
    await axios.post(`/payments/${rentalId}/refund`);
    alert("Deposit refunded!");
  };

  return (
    <button className="bg-blue-500 text-white px-4 py-2 mt-2">
      Refund Deposit
    </button>
  );
}
