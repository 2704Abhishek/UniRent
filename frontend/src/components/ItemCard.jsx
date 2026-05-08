import { Link } from "react-router-dom";

const fallbackImage = "https://placehold.co/600x400?text=UniRent";

export default function ItemCard({ item, action }) {
  const image = item.images?.[0] || fallbackImage;
  const isUnavailable = item.available === false || item.isOnRent;

  return (
    <article className={`group overflow-hidden rounded-lg border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${isUnavailable ? "border-amber-200" : "border-slate-200 hover:border-blue-200"}`}>
      <Link to={`/items/${item._id}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={item.title}
            className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            {item.category || "General"}
          </span>
          {isUnavailable ? (
            <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 shadow-sm">
              Not available
            </span>
          ) : null}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <Link to={`/items/${item._id}`} className="block">
            <h3 className="line-clamp-1 text-lg font-bold text-ink transition group-hover:text-campus">{item.title}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description || "Ready for short-term campus rentals."}</p>
          {item.address ? (
            <p className="mt-2 line-clamp-1 text-xs font-medium text-slate-500">Pickup: {item.address}</p>
          ) : null}
        </div>
        <div className="flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Rent per day</p>
            <p className="text-lg font-bold text-campus">Rs. {item.pricePerDay}</p>
          </div>
          <p className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Deposit Rs. {item.depositAmount || 0}
          </p>
        </div>
        <div className="flex gap-2">
          {isUnavailable ? (
            <button
              type="button"
              disabled
              className="flex-1 rounded-md bg-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-500"
            >
              Item not available
            </button>
          ) : (
            <Link
              to={`/items/${item._id}`}
              className="flex-1 rounded-md bg-campus px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Rent this item
            </Link>
          )}
          {action}
        </div>
      </div>
    </article>
  );
}
