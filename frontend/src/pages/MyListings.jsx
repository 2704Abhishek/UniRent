import { useEffect, useState } from "react";
import { RENTAL_CATEGORIES } from "../constants/categories";
import { api } from "../services/api";

const emptyDraft = {
  title: "",
  description: "",
  category: "",
  address: "",
  pricePerDay: "",
  depositAmount: "",
  imageUrl: "",
  available: true
};

const fallbackImage = "https://placehold.co/600x400?text=No+Image";

export default function MyListings() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Loading your listings...");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);

  const loadItems = async () => {
    try {
      const data = await api.get("/items/mine");
      setItems(data);
      setMessage(data.length ? "" : "You have not listed any items yet.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const startEditing = (item) => {
    setEditingId(item._id);
    setDraft({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      address: item.address || "",
      pricePerDay: item.pricePerDay || "",
      depositAmount: item.depositAmount || "",
      imageUrl: item.images?.[0] || "",
      available: item.available ?? true
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const saveItem = async (itemId) => {
    try {
      await api.put(`/items/${itemId}`, {
        title: draft.title,
        description: draft.description,
        category: draft.category,
        address: draft.address,
        pricePerDay: Number(draft.pricePerDay),
        depositAmount: Number(draft.depositAmount || 0),
        available: draft.available,
        images: draft.imageUrl.trim() ? [draft.imageUrl.trim()] : []
      });
      setMessage("Listing updated.");
      cancelEditing();
      loadItems();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await api.delete(`/items/${itemId}`);
      setMessage("Listing deleted.");
      if (editingId === itemId) {
        cancelEditing();
      }
      loadItems();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="page-shell">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="label">Owner inventory</p>
        <h1 className="mt-1 text-3xl font-bold">My Listings</h1>
        <p className="mt-2 text-slate-600">Update prices, availability, and images for the items you own.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">{message}</p>
        <button className="btn-secondary" onClick={loadItems}>Refresh</button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            {editingId === item._id ? (
              <div className="space-y-3">
                <input
                  className="field"
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                />
                <textarea
                  className="field min-h-24"
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                />
                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    className="field"
                    value={draft.category}
                    onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                  >
                    <option value="">Choose category</option>
                    {RENTAL_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    className="field"
                    value={draft.pricePerDay}
                    onChange={(event) => setDraft((current) => ({ ...current, pricePerDay: event.target.value }))}
                  />
                  <input
                    type="number"
                    min="0"
                    className="field"
                    value={draft.depositAmount}
                    onChange={(event) => setDraft((current) => ({ ...current, depositAmount: event.target.value }))}
                  />
                </div>
                <input
                  className="field"
                  placeholder="Image URL"
                  value={draft.imageUrl}
                  onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                />
                <textarea
                  className="field min-h-20"
                  placeholder="Pickup address"
                  value={draft.address}
                  onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))}
                />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.available}
                    onChange={(event) => setDraft((current) => ({ ...current, available: event.target.checked }))}
                  />
                  Available for rent
                </label>
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={() => saveItem(item._id)}>
                    Save Changes
                  </button>
                  <button className="btn-secondary" onClick={cancelEditing}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                <img
                  src={item.images?.[0] || fallbackImage}
                  alt={item.title}
                  className="h-36 w-full rounded-md border border-slate-200 object-cover md:h-full"
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                />
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{item.title}</h2>
                      <p className="text-sm text-slate-600">{item.description || "No description provided."}</p>
                    </div>
                    <span className={`status-pill ${item.available ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"}`}>
                      {item.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-4">
                    <p>Category: {item.category || "General"}</p>
                    <p>Rent/day: Rs. {item.pricePerDay}</p>
                    <p>Deposit: Rs. {item.depositAmount || 0}</p>
                    <p>Owner: {item.owner?.name || item.owner?.email || "You"}</p>
                  </div>
                  <p className="rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-900">
                    Pickup address: {item.address || "Not added yet"}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button className="btn-secondary" onClick={() => startEditing(item)}>
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => deleteItem(item._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
