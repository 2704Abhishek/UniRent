import axios from "axios";

export default function PaymentButton({ rentalId }) {
  const handlePayment = async () => {
    await axios.post(`/payments/${rentalId}/initiate`);
    alert("Payment successful, rental active!");
  };

  return (
    <button className="bg-green-500 text-white px-4 py-2 mt-2">
      Pay & Start Rental
    </button>
  );
}
