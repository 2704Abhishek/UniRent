import { useState } from "react";
import { RENTAL_CATEGORIES } from "../constants/categories";
import { api } from "../services/api";

const initialForm = {
  title: "",
  description: "",
  category: "",
  address: "",
  pricePerDay: "",
  depositAmount: "",
  image: null
};

export default function CreateItemForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("category", form.category.trim());
      payload.append("address", form.address.trim());
      payload.append("pricePerDay", Number(form.pricePerDay));
      payload.append("depositAmount", Number(form.depositAmount || 0));

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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="label">Owner tools</p>
        <h2 className="mt-1 text-xl font-bold">List a new item</h2>
        <p className="mt-1 text-sm text-slate-600">Add clear pickup details so renters know where to collect it.</p>
      </div>

      <input
        className="field"
        placeholder="Item title"
        value={form.title}
        onChange={(event) => updateField("title", event.target.value)}
        required
      />
      <textarea
        className="field min-h-28"
        placeholder="Short description"
        value={form.description}
        onChange={(event) => updateField("description", event.target.value)}
      />
      <div className="grid gap-3 md:grid-cols-3">
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
        <input
          type="number"
          min="0"
          className="field"
          placeholder="Rent per day"
          value={form.pricePerDay}
          onChange={(event) => updateField("pricePerDay", event.target.value)}
          required
        />
        <input
          type="number"
          min="0"
          className="field"
          placeholder="Deposit amount"
          value={form.depositAmount}
          onChange={(event) => updateField("depositAmount", event.target.value)}
        />
      </div>
      <textarea
        className="field min-h-24"
        placeholder="Pickup address where the customer can collect this item"
        value={form.address}
        onChange={(event) => updateField("address", event.target.value)}
        required
      />
      <label className="block rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 transition hover:border-campus hover:bg-blue-50">
        <span className="font-semibold">Upload item photo</span>
        <span className="mt-1 block text-slate-500">
          {form.image ? form.image.name : "Choose an image from your device"}
        </span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => updateField("image", event.target.files?.[0] || null)}
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary"
      >
        {isSubmitting ? "Creating..." : "Create Listing"}
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
