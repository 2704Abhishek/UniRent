import { useState } from "react";
import axios from "axios";

export default function OTPVerificationModal({ rentalId }) {
  const [otp, setOtp] = useState("");

  const verifyOtp = async () => {
    await axios.post(`/rentals/${rentalId}/verify-return`, { otp });
    alert("Return confirmed, deposit refunded!");
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-lg font-bold mb-2">Enter Return OTP</h2>
        <input className="border p-2 w-full mb-2" value={otp} onChange={(e) => setOtp(e.target.value)} />
        <button className="bg-blue-500 text-white px-4 py-2" onClick={verifyOtp}>Verify</button>
      </div>
    </div>
  );
}
