import { useState } from "react";
import { api } from "../services/api";

export default function OTPVerificationModal({ rentalId, onVerified, onClose }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const verifyOtp = async () => {
    try {
      await api.post(`/rentals/${rentalId}/verify-return`, { otp });
      setMessage("Return confirmed.");
      onVerified?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="rounded bg-white p-6 shadow-md">
        <h2 className="mb-2 text-lg font-bold">Enter Return OTP</h2>
        <input
          className="mb-2 w-full border p-2"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="bg-blue-500 px-4 py-2 text-white" onClick={verifyOtp}>Verify</button>
          <button className="bg-slate-200 px-4 py-2" onClick={onClose}>Close</button>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      </div>
    </div>
  );
}
