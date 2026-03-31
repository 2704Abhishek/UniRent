import axios from "axios";

export default function DeductButton({ rentalId }) {
  const handleDeduct = async () => {
    await axios.post(`/payments/${rentalId}/deduct`, { deduction_amount: 500 });
    alert("Deposit deducted for damage!");
  };

  return (
    <button className="bg-red-500 text-white px-4 py-2 mt-2">
      Deduct Deposit
    </button>
  );
}
