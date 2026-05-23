import { useState } from "react";
import { api } from "../services/api";

export default function PaymentButton({ rentalId, onSuccess }) {
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  const loadRazorpayCheckout = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    try {
      setIsPaying(true);
      setError("");

      const checkout = await api.post(`/payments/${rentalId}/initiate`, {});
      await loadRazorpayCheckout();

      const razorpay = new window.Razorpay({
        key: checkout.key,
        amount: checkout.order.amount,
        currency: checkout.order.currency,
        name: checkout.name,
        description: checkout.description,
        order_id: checkout.order.id,
        prefill: checkout.prefill,
        readonly: {
          name: Boolean(checkout.prefill?.name),
          email: Boolean(checkout.prefill?.email),
          contact: Boolean(checkout.prefill?.contact)
        },
        hidden: {
          contact: true
        },
        theme: {
          color: "#2563eb"
        },
        handler: async (response) => {
          await api.post(`/payments/${rentalId}/verify`, response);
          setIsPaying(false);
          onSuccess?.();
        },
        modal: {
          ondismiss: () => setIsPaying(false)
        }
      });

      razorpay.on("payment.failed", (response) => {
        setIsPaying(false);
        setError(response.error?.description || "Payment failed. Please try again.");
      });

      razorpay.open();
    } catch (paymentError) {
      setIsPaying(false);
      setError(paymentError.message);
    }
  };

  return (
    <div className="mt-2">
      <button className="btn-primary" onClick={handlePayment} disabled={isPaying}>
        {isPaying ? "Opening Razorpay..." : "Pay & Start Rental"}
      </button>
      {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
