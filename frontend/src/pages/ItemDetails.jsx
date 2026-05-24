import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import RentalRequestForm from "../components/RentalRequestForm";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";
import { getWishlistIds, toggleWishlistItem } from "../utils/wishlist";

const fallbackImage = "https://placehold.co/900x600?text=UniRent";

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState("Loading item...");
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const data = await api.get(`/items/${id}`);
        setItem(data);
        setMessage("");
      } catch (error) {
        setMessage(error.message);
      }
    };

    loadItem();
  }, [id]);

  useEffect(() => {
    setIsWishlisted(getWishlistIds(user?.id).includes(String(id)));
  }, [id, user?.id]);

  if (!item) {
    return <div className="page-shell rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">{message}</div>;
  }

  const image = item.images?.[0] || fallbackImage;
  const isAvailable = item.available !== false && !item.isOnRent;
  const trustSignals = item.trustSignals || {};
  const requestRental = () => {
    if (!isAvailable) return;
    const form = document.getElementById(user ? "rental-request" : "rental-sign-in");
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
    form?.querySelector("input")?.focus({ preventScroll: true });
  };

  const updateWishlist = () => {
    if (!user) return;
    const ids = toggleWishlistItem(user?.id, id);
    setIsWishlisted(ids.includes(String(id)));
  };

  return (
    <div className="page-shell">
      <section className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft lg:grid-cols-[1fr_0.9fr]">
        <img
          src={image}
          alt={item.title}
          className="h-72 w-full object-cover lg:h-full"
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
        />
        <div className="space-y-5 p-6">
          <div>
            <p className="label">{item.category || "General"}</p>
            <h1 className="mt-2 text-3xl font-bold">{item.title}</h1>
            <p className="mt-3 leading-7 text-slate-600">{item.description || "No description added yet."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                Condition: {item.condition || "Good"}
              </span>
              {item.brandModel ? (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {item.brandModel}
                </span>
              ) : null}
              {trustSignals.universityVerified ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  University verified owner
                </span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-700">Rent</p>
              <p className="mt-1 text-2xl font-bold text-campus">Rs. {item.pricePerDay}/day</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Deposit</p>
              <p className="mt-1 text-2xl font-bold">Rs. {item.depositAmount || 0}</p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="label mb-1">Owner</p>
                <p className="font-semibold text-ink">{item.owner?.name || item.owner?.email || "Unknown"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {trustSignals.reviewCount || 0} reviews - {trustSignals.completedRentals || 0} completed rentals
                </p>
              </div>
              <div className="rounded-md bg-emerald-50 px-4 py-3 text-center">
                <p className="text-xs font-semibold text-emerald-700">Safe Rental Score</p>
                <p className="text-2xl font-bold text-emerald-900">{trustSignals.safeRentalScore || 45}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-700">Phone number</p>
                <p className="mt-1 font-semibold text-blue-950">{item.contactPhone || "Phone number not added yet."}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Owner rating</p>
                <p className="mt-1 font-semibold text-ink">
                  {trustSignals.ratingAverage ? `${trustSignals.ratingAverage}/5` : "No ratings yet"}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="label mb-1 text-emerald-700">Collection address</p>
            <p className="font-semibold">{item.address || "Pickup address will be shared by the owner."}</p>
            {item.pickupInstructions ? (
              <p className="mt-2 leading-6">{item.pickupInstructions}</p>
            ) : null}
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-500">Included accessories</p>
              <p className="mt-1 font-semibold text-ink">{item.accessories || "Not specified"}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-500">Late return fee</p>
              <p className="mt-1 font-semibold text-ink">Rs. {item.lateReturnFee || 0}/day</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-500">Availability</p>
              <p className="mt-1 font-semibold text-ink">{isAvailable ? "Available now" : "Currently on rent"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" type="button" onClick={requestRental} disabled={!isAvailable}>
              {isAvailable ? "Rent this item" : "Currently on rent"}
            </button>
            <button
              className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                isWishlisted
                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              }`}
              type="button"
              onClick={updateWishlist}
              disabled={!user}
            >
              <span aria-hidden="true" className="mr-2">{isWishlisted ? "♥" : "♡"}</span>
              {!user ? "Sign in to save" : isWishlisted ? "Saved in wishlist" : "Add to wishlist"}
            </button>
          </div>
        </div>
      </section>

      {isAvailable && user ? (
        <RentalRequestForm itemId={id} item={item} />
      ) : isAvailable ? (
        <section id="rental-sign-in" className="rounded-lg border border-blue-100 bg-blue-50 p-5 text-sm text-blue-950 shadow-sm">
          <p className="font-bold">Sign in to request this rental</p>
          <p className="mt-1">
            You can view item details publicly. To choose dates, create a rental request, and use checkout, please sign in first.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn-primary" to="/login">Sign in</Link>
            <Link className="btn-secondary" to="/signup">Create account</Link>
          </div>
        </section>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          This item is already on rent, so new rental requests are closed for now.
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-sm">
        <p className="label">Before you rent</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <p className="rounded-md bg-slate-50 p-3 text-slate-700">Check the item photo, condition, and included accessories before pickup.</p>
          <p className="rounded-md bg-slate-50 p-3 text-slate-700">Use the app payment and rental status so deposit and return records stay clear.</p>
          <p className="rounded-md bg-slate-50 p-3 text-slate-700">Return through OTP confirmation to protect both renter and owner.</p>
        </div>
      </section>
    </div>
  );
}
