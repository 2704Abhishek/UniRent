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
  const [activeView, setActiveView] = useState(null);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewMessages, setReviewMessages] = useState({});
  const [submittedReviewIds, setSubmittedReviewIds] = useState({});

  const fetchRentals = async () => {
    try {
      const data = await api.get("/rentals/my");
      setRentals(data);
      setMessage("");
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

  const updateReviewDraft = (rentalId, field, value) => {
    setReviewDrafts((current) => ({
      ...current,
      [rentalId]: {
        rating: "5",
        comment: "",
        ...(current[rentalId] || {}),
        [field]: value
      }
    }));
  };

  const submitReview = async (rental) => {
    const draft = reviewDrafts[rental._id] || { rating: "5", comment: "" };

    try {
      await api.post("/reviews", {
        target_user_id: rental.owner_id?._id || rental.owner_id,
        rental_id: rental._id,
        item_id: rental.item_id?._id || rental.item_id,
        rating: Number(draft.rating || 5),
        comment: draft.comment,
        review_type: "owner"
      });
      setMessage("Review submitted. Thanks for helping other customers choose safely.");
      setReviewMessages((current) => ({ ...current, [rental._id]: "Review submitted successfully." }));
      setSubmittedReviewIds((current) => ({ ...current, [rental._id]: true }));
      setReviewDrafts((current) => ({ ...current, [rental._id]: { rating: "5", comment: "" } }));
      fetchRentals();
    } catch (error) {
      setMessage(error.message);
      setReviewMessages((current) => ({ ...current, [rental._id]: error.message }));
    }
  };

  const checkRefundStatus = async (rentalId) => {
    try {
      const data = await api.get(`/payments/${rentalId}/refund-status`);
      setMessage(data.message || "Refund status updated.");
      fetchRentals();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

  const getRentalDays = (rental) => {
    if (!rental.start_date || !rental.end_date) return 1;
    const start = new Date(rental.start_date);
    const end = new Date(rental.end_date);
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(diffDays, 1);
  };

  const getRentAmount = (rental) => {
    const savedRent = Number(rental.rent_price || 0);
    const dailyRent = Number(rental.item_id?.pricePerDay || 0);
    const rentalDays = getRentalDays(rental);
    return savedRent === dailyRent && rentalDays > 1 ? dailyRent * rentalDays : savedRent;
  };

  const renterRentals = rentals.filter((rental) => isCurrentUser(rental.renter_id));
  const ownerRentals = rentals.filter((rental) => isCurrentUser(rental.owner_id) && !isCurrentUser(rental.renter_id));
  const selectedRentals = activeView === "rented" ? renterRentals : ownerRentals;
  const activeViewMeta = activeView === "rented"
    ? {
        label: "Borrowing",
        title: "Items I Rented",
        description: "Pay pending requests, generate return OTPs, and track the items you borrowed.",
        countText: `${renterRentals.length} rentals`,
        empty: "You have not rented any items yet.",
        view: "renter"
      }
    : {
        label: "Owner activity",
        title: "My Items on Rent",
        description: "See who rented your items, manage returned items, and settle deposits.",
        countText: `${ownerRentals.length} active records`,
        empty: "No one has rented your listed items yet.",
        view: "owner"
      };

  const optionCardClass = (view) =>
    `rounded-lg border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${
      activeView === view ? "border-campus bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"
    }`;

  const timelineSteps = [
    { key: "pending", label: "Requested" },
    { key: "approved", label: "Approved" },
    { key: "paid", label: "Paid" },
    { key: "active", label: "Active" },
    { key: "returned", label: "Returned" },
    { key: "refunded", label: "Refunded" }
  ];

  const isStepDone = (rental, stepKey) => {
    const statusOrder = ["pending", "approved", "active", "returned", "refunded"];
    if (stepKey === "refunded") return rental.refund_status === "refunded" || rental.rental_status === "refunded";
    if (stepKey === "paid") return rental.payment_status === "paid";
    const currentIndex = statusOrder.indexOf(rental.rental_status);
    const stepIndex = statusOrder.indexOf(stepKey);
    return currentIndex >= stepIndex;
  };

  const renderRentalCard = (rental, view) => {
    const isRenterView = view === "renter";
    const isOwnerView = view === "owner";
    const canPay = isRenterView && rental.payment_status === "pending";
    const canDelete = canPay && rental.rental_status === "pending";
    const canReturn = isRenterView && ["approved", "active"].includes(rental.rental_status);
    const canSettleDeposit = isOwnerView && rental.rental_status === "returned" && ["pending", "failed"].includes(rental.refund_status);
    const canDeductDeposit = isOwnerView && rental.rental_status === "returned" && rental.refund_status === "pending";
    const reviewSubmitted = Boolean(rental.my_review_submitted || submittedReviewIds[rental._id]);
    const canReviewOwner = isRenterView && ["returned", "refunded"].includes(rental.rental_status) && !reviewSubmitted;
    const canCheckRefund = ["processing", "refunded"].includes(rental.refund_status) && rental.razorpay_refund_id;
    const refundStatusText = rental.refund_status === "processing"
      ? `processing${rental.refund_processor_status ? ` (${rental.refund_processor_status})` : ""}`
      : rental.refund_status;
    const rentAmount = getRentAmount(rental);
    const depositAmount = Number(rental.deposit_amount ?? rental.item_id?.depositAmount ?? 0);
    const totalToPay = rentAmount + depositAmount;
    const otherPerson = isOwnerView ? rental.renter_id : rental.owner_id;
    const otherPersonLabel = isOwnerView ? "Rented by" : "Owner";

    return (
      <div key={rental._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="label">{isOwnerView ? "Your item" : "Item"}</p>
            <h2 className="mt-1 text-xl font-bold">{rental.item_id?.title || "Untitled item"}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {rental.start_date ? new Date(rental.start_date).toLocaleDateString() : "-"}
              {" "}to{" "}
              {rental.end_date ? new Date(rental.end_date).toLocaleDateString() : "-"}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {otherPersonLabel}: {otherPerson?.name || otherPerson?.email || "Unknown"}
            </p>
          </div>
          <span className="status-pill bg-blue-50 text-blue-700">{rental.rental_status}</span>
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-blue-700">Rent amount</p>
            <p className="font-semibold text-ink">{formatMoney(rentAmount)}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-slate-500">Deposit</p>
            <p className="font-semibold text-ink">{formatMoney(depositAmount)}</p>
          </div>
          <div className="rounded-md bg-emerald-50 p-3">
            <p className="text-emerald-700">{isOwnerView ? "Customer paid" : "You pay"}</p>
            <p className="font-semibold text-ink">{formatMoney(totalToPay)}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-slate-500">Payment status</p>
            <p className="font-semibold text-ink">{rental.payment_status}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-slate-500">Refund status</p>
            <p className="font-semibold text-ink">{refundStatusText}</p>
          </div>
        </div>

        {rental.razorpay_refund_id ? (
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-950">
            <p className="font-semibold">Razorpay refund id: {rental.razorpay_refund_id}</p>
            {rental.refund_reference ? (
              <p className="mt-1">Bank reference: {rental.refund_reference}</p>
            ) : (
              <p className="mt-1">Bank reference appears after Razorpay/bank processes the refund.</p>
            )}
            {rental.refund_status === "processing" ? (
              <p className="mt-1">Refund has been initiated. Normal refunds can take several working days to reach the customer.</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rental timeline</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {timelineSteps.map((step) => {
              const done = isStepDone(rental, step.key);
              return (
                <div
                  key={step.key}
                  className={`rounded-md px-3 py-2 text-xs font-bold ${
                    done ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-500"
                  }`}
                >
                  {step.label}
                </div>
              );
            })}
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
          <>
            <RefundButton rentalId={rental._id} onSuccess={fetchRentals} />
            {canDeductDeposit ? <DeductButton rentalId={rental._id} onSuccess={fetchRentals} /> : null}
          </>
        ) : null}

        {canCheckRefund ? (
          <button className="btn-secondary mt-2" type="button" onClick={() => checkRefundStatus(rental._id)}>
            Check Refund Status
          </button>
        ) : null}

        {canReturn ? (
          <button
            className="btn-primary mt-2"
            onClick={() => generateReturnOtp(rental._id)}
          >
            Generate Return OTP
          </button>
        ) : null}

        {canReviewOwner ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="label">Review owner</p>
            <div className="mt-3 grid gap-3 md:grid-cols-[140px_1fr_auto]">
              <select
                className="field"
                value={reviewDrafts[rental._id]?.rating || "5"}
                onChange={(event) => updateReviewDraft(rental._id, "rating", event.target.value)}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Okay</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Bad</option>
              </select>
              <input
                className="field"
                placeholder="Share pickup, item condition, or owner response experience"
                value={reviewDrafts[rental._id]?.comment || ""}
                onChange={(event) => updateReviewDraft(rental._id, "comment", event.target.value)}
              />
              <button className="btn-primary" type="button" onClick={() => submitReview(rental)}>
                Submit Review
              </button>
            </div>
            {reviewMessages[rental._id] ? (
              <p className="mt-2 text-sm font-medium text-slate-600">{reviewMessages[rental._id]}</p>
            ) : null}
          </div>
        ) : null}
        {isRenterView && reviewSubmitted ? (
          <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            Review submitted. Thanks for sharing your experience.
          </div>
        ) : null}
      </div>
    );
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

      {!activeView ? (
        <>
          <section className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              className={optionCardClass("rented")}
              onClick={() => setActiveView("rented")}
            >
              <span className="label">Customer actions</span>
              <span className="mt-2 block text-2xl font-bold text-ink">Items I Rented</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">
                Pay pending requests, generate return OTPs, and track items you borrowed.
              </span>
              <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-campus shadow-sm">
                {renterRentals.length} rentals
              </span>
            </button>
            <button
              type="button"
              className={optionCardClass("owner")}
              onClick={() => setActiveView("owner")}
            >
              <span className="label">Owner actions</span>
              <span className="mt-2 block text-2xl font-bold text-ink">My Items on Rent</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">
                See who rented your items, manage returned items, and settle deposits.
              </span>
              <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-campus shadow-sm">
                {ownerRentals.length} active records
              </span>
            </button>
          </section>

          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
            Choose one option above to open only the actions for that rental type.
          </div>
        </>
      ) : (
        <section className="rounded-lg border border-campus bg-blue-50/40 p-4 shadow-sm sm:p-5">
          <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="label">{activeViewMeta.label}</p>
                <h2 className="mt-1 text-2xl font-bold">{activeViewMeta.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {activeViewMeta.description}
                </p>
                <span className="mt-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-campus">
                  {activeViewMeta.countText}
                </span>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveView(null)}
              >
                Back to options
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {selectedRentals.length ? selectedRentals.map((rental) => renderRentalCard(rental, activeViewMeta.view)) : (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
                {activeViewMeta.empty}
              </div>
            )}
          </div>
        </section>
      )}

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
