import { Link } from "react-router-dom";

const fallbackImage = "https://placehold.co/600x400?text=UniRent";

export default function ItemCard({ item }) {
  const image = item.images?.[0] || fallbackImage;

  return (
    <Link
      to={`/items/${item._id}`}
      className="group block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="relative">
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
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-lg font-bold text-ink">{item.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description || "Ready for short-term campus rentals."}</p>
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
        <div className="rounded-md bg-campus px-4 py-2 text-center text-sm font-semibold text-white transition group-hover:bg-blue-700">
          Rent this item
        </div>
      </div>
    </Link>
  );
}
