import { useContext, useEffect, useState } from "react";
import CreateItemForm from "../components/CreateItemForm";
import ItemCard from "../components/ItemCard";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Loading items...");
  const [mode, setMode] = useState(null);
  const rentableItems = user
    ? items.filter((item) => {
        const ownerId = item.owner?._id || item.owner?.id || item.owner;
        return String(ownerId) !== String(user.id);
      })
    : items;

  const loadItems = async () => {
    try {
      const data = await api.get("/items");
      setItems(data);
      setMessage(data.length ? "" : "No items available yet.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="page-shell">
      <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <p className="label">Student rental marketplace</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-ink">
            What would you like to do today?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Choose whether you want to take something on rent or give your own item on rent.
          </p>
        </div>
        <div className="grid content-center gap-3 rounded-lg bg-slate-50 p-4">
          <div className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
            <span className="text-sm font-medium text-slate-600">Items from other users</span>
            <span className="text-2xl font-bold text-campus">{rentableItems.length}</span>
          </div>
          <div className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-600">
            Select one option below to continue.
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          className={`rounded-lg border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${mode === "rent" ? "border-campus bg-blue-50" : "border-slate-200 bg-white"}`}
          onClick={() => setMode("rent")}
        >
          <span className="label">Take on rent</span>
          <span className="mt-2 block text-2xl font-bold text-ink">Rent an item</span>
          <span className="mt-2 block text-sm leading-6 text-slate-600">
            Browse items listed by other students and send a rental request.
          </span>
        </button>
        <button
          type="button"
          className={`rounded-lg border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${mode === "list" ? "border-campus bg-blue-50" : "border-slate-200 bg-white"}`}
          onClick={() => setMode("list")}
        >
          <span className="label">Give on rent</span>
          <span className="mt-2 block text-2xl font-bold text-ink">List your item</span>
          <span className="mt-2 block text-sm leading-6 text-slate-600">
            Add your item photo, rent price, and deposit so others can request it.
          </span>
        </button>
      </div>

      {!mode ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-center text-sm text-slate-600 shadow-sm">
          Please choose one option above.
        </div>
      ) : mode === "list" ? (
        user ? (
          <CreateItemForm onCreated={loadItems} />
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Please sign in to list your item for rent.
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label">Rent items</p>
              <h2 className="mt-1 text-2xl font-bold">Choose something to rent</h2>
            </div>
            <button className="btn-secondary" onClick={loadItems}>Refresh</button>
          </div>

          {message ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              {message}
            </div>
          ) : null}

          {!message && rentableItems.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              No items from other users are available to rent yet.
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rentableItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
