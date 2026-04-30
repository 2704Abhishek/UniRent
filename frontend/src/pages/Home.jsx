import { useContext, useEffect, useState } from "react";
import CreateItemForm from "../components/CreateItemForm";
import ItemCard from "../components/ItemCard";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Loading items...");

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
            Borrow what you need, list what you do not use.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Browse campus-ready items, compare deposits, and request short-term rentals from trusted student owners.
          </p>
        </div>
        <div className="grid content-center gap-3 rounded-lg bg-slate-50 p-4">
          <div className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
            <span className="text-sm font-medium text-slate-600">Available listings</span>
            <span className="text-2xl font-bold text-campus">{items.length}</span>
          </div>
          <div className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-600">
            {user ? "You can publish a listing directly below." : "Log in to create listings and send rental requests."}
          </div>
        </div>
      </section>

      {user ? <CreateItemForm onCreated={loadItems} /> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label">Marketplace</p>
          <h2 className="mt-1 text-2xl font-bold">Available items</h2>
        </div>
        <button className="btn-secondary" onClick={loadItems}>Refresh</button>
      </div>

      {message ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}
