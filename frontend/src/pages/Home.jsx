import { useContext, useEffect, useMemo, useState } from "react";
import CreateItemForm from "../components/CreateItemForm";
import ItemCard from "../components/ItemCard";
import { RENTAL_CATEGORIES } from "../constants/categories";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Loading items...");
  const [mode, setMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const rentableItems = user
    ? items.filter((item) => {
        const ownerId = item.owner?._id || item.owner?.id || item.owner;
        return String(ownerId) !== String(user.id);
      })
    : items;
  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return rentableItems.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const haystack = [
        item.title,
        item.description,
        item.category,
        item.address,
        item.owner?.name
      ].filter(Boolean).join(" ").toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });
  }, [activeCategory, rentableItems, searchTerm]);

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
      <section className="grid gap-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <div className="p-6 sm:p-8">
            <p className="label">Student rental marketplace</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-ink">
              Rent useful campus items without the long chase.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Search the things you need, save favorites, or list your own item with a clear pickup address.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {RENTAL_CATEGORIES.slice(0, 7).map((category) => (
                <button
                  key={category}
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-campus"
                  onClick={() => {
                    setMode("rent");
                    setActiveCategory(category);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid content-center gap-3 bg-gradient-to-br from-blue-50 via-emerald-50 to-white p-6">
          <div className="flex items-center justify-between rounded-md bg-white/90 p-3 shadow-sm">
            <span className="text-sm font-medium text-slate-600">Items from other users</span>
            <span className="text-2xl font-bold text-campus">{rentableItems.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-ink p-3 text-white shadow-sm">
              <p className="text-xs text-blue-100">Quick search</p>
              <p className="text-lg font-bold">Fast</p>
            </div>
            <div className="rounded-md bg-mint p-3 text-white shadow-sm">
              <p className="text-xs text-emerald-50">Pickup info</p>
              <p className="text-lg font-bold">Clear</p>
            </div>
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
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="label">Rent items</p>
                <h2 className="mt-1 text-2xl font-bold">Choose something to rent</h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className="field sm:w-80"
                  placeholder="Search shirt, laptop, charger..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <button className="btn-secondary" onClick={loadItems}>Refresh</button>
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {["All", ...RENTAL_CATEGORIES].map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    activeCategory === category
                      ? "border-campus bg-blue-50 text-campus"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Showing {filteredItems.length} of {rentableItems.length} rentable items
              </p>
            </div>
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

          {!message && rentableItems.length > 0 && filteredItems.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              No matching items found. Try another search or category.
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
