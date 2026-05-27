import { useEffect, useState } from "react";
import { RENTAL_CATEGORIES } from "../constants/categories";
import { api } from "../services/api";

const emptyDraft = {
  title: "",
  description: "",
  category: "",
  condition: "Good",
  brandModel: "",
  accessories: "",
  contactPhone: "",
  address: "",
  pickupInstructions: "",
  pricePerDay: "",
  depositAmount: "",
  lateReturnFee: "",
  currentImageUrl: "",
  imageFile: null,
  available: true
};

const fallbackImage = "https://placehold.co/600x400?text=No+Image";

export default function MyListings() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Loading your listings...");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

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

  useEffect(() => {
    if (!draft.imageFile) {
      setImagePreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(draft.imageFile);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [draft.imageFile]);

  const startEditing = (item) => {
    setEditingId(item._id);
    setDraft({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      condition: item.condition || "Good",
      brandModel: item.brandModel || "",
      accessories: item.accessories || "",
      contactPhone: item.contactPhone || "",
      address: item.address || "",
      pickupInstructions: item.pickupInstructions || "",
      pricePerDay: item.pricePerDay || "",
      depositAmount: item.depositAmount || "",
      lateReturnFee: item.lateReturnFee || "",
      currentImageUrl: item.images?.[0] || "",
      imageFile: null,
      available: item.available ?? true
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const saveItem = async (itemId) => {
    try {
      const payload = new FormData();
      payload.append("title", draft.title);
      payload.append("description", draft.description);
      payload.append("category", draft.category);
      payload.append("condition", draft.condition);
      payload.append("brandModel", draft.brandModel);
      payload.append("accessories", draft.accessories);
      payload.append("contactPhone", draft.contactPhone);
      payload.append("address", draft.address);
      payload.append("pickupInstructions", draft.pickupInstructions);
      payload.append("pricePerDay", Number(draft.pricePerDay));
      payload.append("depositAmount", Number(draft.depositAmount || 0));
      payload.append("lateReturnFee", Number(draft.lateReturnFee || 0));
      payload.append("available", draft.available ? "true" : "false");

      if (draft.imageFile) {
        payload.append("image", draft.imageFile);
      }

      await api.put(`/items/${itemId}`, payload);
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
                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    className="field"
                    value={draft.condition}
                    onChange={(event) => setDraft((current) => ({ ...current, condition: event.target.value }))}
                  >
                    <option value="New">New</option>
                    <option value="Like new">Like new</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs care">Needs care</option>
                  </select>
                  <input
                    className="field md:col-span-2"
                    placeholder="Brand or model"
                    value={draft.brandModel}
                    onChange={(event) => setDraft((current) => ({ ...current, brandModel: event.target.value }))}
                  />
                </div>
                <input
                  className="field"
                  placeholder="Included accessories"
                  value={draft.accessories}
                  onChange={(event) => setDraft((current) => ({ ...current, accessories: event.target.value }))}
                />
                <label className="block rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-semibold">Item photo</span>
                  <span className="mt-1 block text-slate-500">
                    {draft.imageFile ? draft.imageFile.name : "Choose a new image from your device"}
                  </span>
                  <img
                    src={imagePreviewUrl || draft.currentImageUrl || fallbackImage}
                    alt="Selected item preview"
                    className="mt-3 h-48 w-full rounded-md border border-slate-200 bg-white object-cover"
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-campus file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        imageFile: event.target.files?.[0] || null
                      }));
                    }}
                  />
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  maxLength="18"
                  className="field"
                  placeholder="Phone number"
                  value={draft.contactPhone}
                  onChange={(event) => setDraft((current) => ({ ...current, contactPhone: event.target.value }))}
                />
                <textarea
                  className="field min-h-20"
                  placeholder="Pickup address"
                  value={draft.address}
                  onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))}
                />
                <textarea
                  className="field min-h-20"
                  placeholder="Pickup instructions"
                  value={draft.pickupInstructions}
                  onChange={(event) => setDraft((current) => ({ ...current, pickupInstructions: event.target.value }))}
                />
                <input
                  type="number"
                  min="0"
                  className="field"
                  placeholder="Late return fee per day"
                  value={draft.lateReturnFee}
                  onChange={(event) => setDraft((current) => ({ ...current, lateReturnFee: event.target.value }))}
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
                    <span className={`status-pill ${item.isOnRent ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {item.isOnRent ? "On rent" : "Available"}
                    </span>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-4">
                    <p>Category: {item.category || "General"}</p>
                    <p>Condition: {item.condition || "Good"}</p>
                    <p>Rent/day: Rs. {item.pricePerDay}</p>
                    <p>Deposit: Rs. {item.depositAmount || 0}</p>
                  </div>
                  {item.brandModel || item.accessories || item.lateReturnFee ? (
                    <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-3">
                      <p>Brand/model: {item.brandModel || "Not added"}</p>
                      <p>Accessories: {item.accessories || "Not added"}</p>
                      <p>Late fee: Rs. {item.lateReturnFee || 0}/day</p>
                    </div>
                  ) : null}
                  <p className="rounded-md bg-blue-50 p-3 text-sm font-medium text-blue-900">
                    Phone number: {item.contactPhone || "Not added yet"}
                  </p>
                  <p className="rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-900">
                    Pickup address: {item.address || "Not added yet"}
                  </p>
                  <p className="rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700">
                    Pickup instructions: {item.pickupInstructions || "Not added yet"}
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
