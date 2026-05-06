import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const requestRental = () => {
    const form = document.getElementById("rental-request");
    form?.scrollIntoView({ behavior: "smooth", block: "start" });
    form?.querySelector("input")?.focus({ preventScroll: true });
  };

  const updateWishlist = () => {
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
            <p className="label mb-1">Owner</p>
            <p className="font-semibold text-ink">{item.owner?.name || item.owner?.email || "Unknown"}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" type="button" onClick={requestRental}>
              Rent this item
            </button>
            <button
              className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                isWishlisted
                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              }`}
              type="button"
              onClick={updateWishlist}
            >
              <span aria-hidden="true" className="mr-2">{isWishlisted ? "♥" : "♡"}</span>
              {isWishlisted ? "Saved in wishlist" : "Add to wishlist"}
            </button>
          </div>
        </div>
      </section>

      <RentalRequestForm itemId={id} />
    </div>
  );
}
