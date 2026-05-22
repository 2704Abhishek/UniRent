import { useEffect, useState } from "react";
import { RENTAL_CATEGORIES } from "../constants/categories";
import { api } from "../services/api";

const initialForm = {
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
  image: null
};

export default function CreateItemForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!form.image) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(form.image);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [form.image]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const rentPreview = Number(form.pricePerDay || 0).toLocaleString("en-IN");
  const depositPreview = Number(form.depositAmount || 0).toLocaleString("en-IN");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("category", form.category.trim());
      payload.append("condition", form.condition.trim());
      payload.append("brandModel", form.brandModel.trim());
      payload.append("accessories", form.accessories.trim());
      payload.append("contactPhone", form.contactPhone.trim());
      payload.append("address", form.address.trim());
      payload.append("pickupInstructions", form.pickupInstructions.trim());
      payload.append("pricePerDay", Number(form.pricePerDay));
      payload.append("depositAmount", Number(form.depositAmount || 0));
      payload.append("lateReturnFee", Number(form.lateReturnFee || 0));

      if (form.image) {
        payload.append("image", form.image);
      }

      await api.post("/items", payload);
      setForm(initialForm);
      setMessage("Item listed successfully.");
      onCreated?.();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="grid lg:grid-cols-[1fr_340px]">
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="label">Owner tools</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">List a new item</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add clear pricing, contact, and pickup details so renters can request with confidence.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-campus">
              New listing
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Item title</span>
              <input
                className="field"
                placeholder="Study table, lab coat, calculator..."
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                required
              />
            </label>

            <label className="space-y-1.5 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Short description</span>
              <textarea
                className="field min-h-28 resize-y"
                placeholder="Condition, included accessories, size, or pickup timing"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Category</span>
              <select
                className="field"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                required
              >
                <option value="">Choose category</option>
                {RENTAL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Rent per day</span>
                <input
                  type="number"
                  min="0"
                  className="field"
                  placeholder="Rs."
                  value={form.pricePerDay}
                  onChange={(event) => updateField("pricePerDay", event.target.value)}
                  required
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Deposit</span>
                <input
                  type="number"
                  min="0"
                  className="field"
                  placeholder="Rs."
                  value={form.depositAmount}
                  onChange={(event) => updateField("depositAmount", event.target.value)}
                />
              </label>
            </div>

            <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Condition</span>
                <select
                  className="field"
                  value={form.condition}
                  onChange={(event) => updateField("condition", event.target.value)}
                >
                  <option value="New">New</option>
                  <option value="Like new">Like new</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs care">Needs care</option>
                </select>
              </label>
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Brand or model</span>
                <input
                  className="field"
                  placeholder="Casio FX-991ES, Dell charger, lab coat size M"
                  value={form.brandModel}
                  onChange={(event) => updateField("brandModel", event.target.value)}
                />
              </label>
            </div>

            <label className="space-y-1.5 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Included accessories</span>
              <input
                className="field"
                placeholder="Cable, cover, bag, manual, charger..."
                value={form.accessories}
                onChange={(event) => updateField("accessories", event.target.value)}
              />
            </label>

            <label className="space-y-1.5 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Phone number</span>
              <input
                type="tel"
                inputMode="tel"
                maxLength="18"
                className="field"
                placeholder="Owner contact number"
                value={form.contactPhone}
                onChange={(event) => updateField("contactPhone", event.target.value)}
              />
            </label>

            <label className="space-y-1.5 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Pickup address</span>
              <textarea
                className="field min-h-24 resize-y"
                placeholder="Pickup address where the customer can collect this item"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                required
              />
            </label>

            <label className="space-y-1.5 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Pickup instructions</span>
              <textarea
                className="field min-h-20 resize-y"
                placeholder="Available pickup time, landmark, ID check, handover notes"
                value={form.pickupInstructions}
                onChange={(event) => updateField("pickupInstructions", event.target.value)}
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Late return fee per day</span>
              <input
                type="number"
                min="0"
                className="field"
                placeholder="Rs."
                value={form.lateReturnFee}
                onChange={(event) => updateField("lateReturnFee", event.target.value)}
              />
            </label>
          </div>
        </div>

        <aside className="border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
          <div className="space-y-4">
            <div>
              <p className="label">Listing preview</p>
              <h3 className="mt-1 text-lg font-bold text-ink">
                {form.title.trim() || "Untitled item"}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                {form.description.trim() || "Description will appear here."}
              </p>
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                Condition: {form.condition || "Good"}
              </p>
            </div>

            <label className="group block cursor-pointer rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700 transition hover:border-campus hover:bg-blue-50">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Selected item preview"
                  className="h-48 w-full rounded-md object-cover"
                />
              ) : (
                <span className="flex h-48 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-500">
                  Photo preview
                </span>
              )}
              <span className="mt-3 block font-semibold">Upload item photo</span>
              <span className="mt-1 block truncate text-slate-500">
                {form.image ? form.image.name : "Choose an image from your device"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => updateField("image", event.target.files?.[0] || null)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">Rent/day</p>
                <p className="mt-1 text-lg font-bold text-campus">Rs. {rentPreview}</p>
              </div>
              <div className="rounded-md bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">Deposit</p>
                <p className="mt-1 text-lg font-bold text-ink">Rs. {depositPreview}</p>
              </div>
            </div>

            <div className="space-y-2 rounded-md bg-white p-3 text-sm shadow-sm">
              <p className="font-semibold text-slate-700">Phone: {form.contactPhone.trim() || "Not added yet"}</p>
              <p className="line-clamp-3 text-slate-600">Pickup: {form.address.trim() || "Address not added yet"}</p>
              <p className="line-clamp-2 text-slate-600">Accessories: {form.accessories.trim() || "Not added yet"}</p>
              <p className="font-medium text-slate-700">Late fee: Rs. {Number(form.lateReturnFee || 0).toLocaleString("en-IN")}/day</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {message ? <p className="text-sm font-medium text-slate-600">{message}</p> : <span />}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary sm:min-w-36"
        >
          {isSubmitting ? "Creating..." : "Create Listing"}
        </button>
      </div>
    </form>
  );
}
