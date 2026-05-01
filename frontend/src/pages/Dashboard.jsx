import { useContext, useEffect, useState } from "react";
import DeductButton from "../components/DeductButton";
import OTPVerificationModal from "../components/OTPVerificationModel";
import PaymentButton from "../components/PaymentButton";
import RefundButton from "../components/RefundButton";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [rentals, setRentals] = useState([]);
  const [message, setMessage] = useState("Loading rentals...");
  const [activeOtpRentalId, setActiveOtpRentalId] = useState(null);

  const fetchRentals = async () => {
    try {
      const data = await api.get("/rentals/my");
      setRentals(data);
      setMessage(data.length ? "" : "No rentals found.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRentals();
    } else {
      setRentals([]);
      setMessage("Log in to view your rentals.");
    }
  }, [user]);

  const generateReturnOtp = async (rentalId) => {
    try {
      await api.post(`/rentals/${rentalId}/return`, {});
      setMessage("Return OTP sent to the owner.");
      setActiveOtpRentalId(rentalId);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const isCurrentUser = (person) => {
    const personId = person?._id || person?.id || person;
    return String(personId) === String(user?.id);
  };

  const deleteRental = async (rentalId) => {
    try {
      await api.delete(`/rentals/${rentalId}`);
      setMessage("Rental request deleted.");
      fetchRentals();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label">Rental activity</p>
          <h1 className="mt-1 text-3xl font-bold">My Rentals</h1>
        </div>
        {!user ? null : (
          <button className="btn-secondary" onClick={fetchRentals}>
            Refresh rentals
          </button>
        )}
      </div>

      {message ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          {message}
        </div>
      ) : null}

      {rentals.map((rental) => {
        const isRenter = isCurrentUser(rental.renter_id);
        const isOwner = isCurrentUser(rental.owner_id);
        const canPay = isRenter && rental.payment_status === "pending";
        const canDelete = canPay && rental.rental_status === "pending";
        const canReturn = isRenter && ["approved", "active"].includes(rental.rental_status);
        const canSettleDeposit = isOwner && rental.rental_status === "returned" && rental.refund_status === "pending";

        return (
          <div key={rental._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="label">Item</p>
                <h2 className="mt-1 text-xl font-bold">{rental.item_id?.title || "Untitled item"}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {rental.start_date ? new Date(rental.start_date).toLocaleDateString() : "-"}
                  {" "}to{" "}
                  {rental.end_date ? new Date(rental.end_date).toLocaleDateString() : "-"}
                </p>
              </div>
              <span className="status-pill bg-blue-50 text-blue-700">{rental.rental_status}</span>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-slate-500">Payment status</p>
                <p className="font-semibold text-ink">{rental.payment_status}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-slate-500">Refund status</p>
                <p className="font-semibold text-ink">{rental.refund_status}</p>
              </div>
            </div>

            {canPay ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <PaymentButton rentalId={rental._id} onSuccess={fetchRentals} />
                {canDelete ? (
                  <button className="btn-danger mt-2" onClick={() => deleteRental(rental._id)}>
                    Delete request
                  </button>
                ) : null}
              </div>
            ) : null}

            {canSettleDeposit ? (
              <RefundButton rentalId={rental._id} onSuccess={fetchRentals} />
            ) : null}

            {canSettleDeposit ? (
              <DeductButton rentalId={rental._id} onSuccess={fetchRentals} />
            ) : null}

            {canReturn ? (
              <button
                className="btn-primary mt-2"
                onClick={() => generateReturnOtp(rental._id)}
              >
                Generate Return OTP
              </button>
            ) : null}
          </div>
        );
      })}

      {activeOtpRentalId ? (
        <OTPVerificationModal
          rentalId={activeOtpRentalId}
          onVerified={() => {
            setActiveOtpRentalId(null);
            fetchRentals();
          }}
          onClose={() => setActiveOtpRentalId(null)}
        />
      ) : null}
    </div>
  );
}
