import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import ItemCard from "../components/ItemCard";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";
import { getWishlistIds, removeWishlistItem } from "../utils/wishlist";

export default function Wishlist() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(() => getWishlistIds(user?.id));
  const [message, setMessage] = useState("Loading wishlist...");

  const loadWishlist = useCallback(async () => {
    const ids = getWishlistIds(user?.id);
    setWishlistIds(ids);

    if (!ids.length) {
      setItems([]);
      setMessage("Your wishlist is empty.");
      return;
    }

    try {
      const data = await api.get("/items");
      setItems(data);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  }, [user?.id]);

  useEffect(() => {
    loadWishlist();
    window.addEventListener("wishlist-updated", loadWishlist);
    return () => window.removeEventListener("wishlist-updated", loadWishlist);
  }, [loadWishlist]);

  const wishlistItems = useMemo(
    () => items.filter((item) => wishlistIds.includes(String(item._id))),
    [items, wishlistIds]
  );

  const removeItem = (itemId) => {
    const nextIds = removeWishlistItem(user?.id, itemId);
    setWishlistIds(nextIds);
    setItems((current) => current.filter((item) => nextIds.includes(String(item._id))));
    setMessage(nextIds.length ? "" : "Your wishlist is empty.");
  };

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label">Saved items</p>
          <h1 className="mt-1 text-3xl font-bold">Wishlist</h1>
        </div>
        <button className="btn-secondary" onClick={loadWishlist}>
          Refresh wishlist
        </button>
      </div>

      {message ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          {message}
        </div>
      ) : null}

      {!message && wishlistItems.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Saved items are no longer available.
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {wishlistItems.map((item) => (
          <ItemCard
            key={item._id}
            item={item}
            action={(
              <button
                type="button"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                onClick={() => removeItem(item._id)}
              >
                Remove
              </button>
            )}
          />
        ))}
      </div>
    </div>
  );
}
