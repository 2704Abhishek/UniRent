import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getWishlistIds } from "../utils/wishlist";

export default function DashboardSidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const [wishlistCount, setWishlistCount] = useState(() => getWishlistIds(user?.id).length);
  const linkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-blue-50 text-campus"
        : "text-slate-600 hover:bg-slate-100 hover:text-ink"
    }`;

  useEffect(() => {
    const updateCount = () => setWishlistCount(getWishlistIds(user?.id).length);
    updateCount();
    window.addEventListener("wishlist-updated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("wishlist-updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, [user?.id]);

  return (
    <aside className="w-full border-b border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur md:sticky md:top-0 md:h-screen md:w-72 md:border-b-0 md:border-r">
      <Link to="/" className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
          UR
        </span>
        <span>
          <span className="block text-xl font-bold tracking-tight">UniRent</span>
          <span className="block text-xs font-medium text-slate-500">Campus rentals</span>
        </span>
      </Link>
      {user ? (
        <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-semibold text-ink">{user.name || "Signed in"}</p>
          <p className="truncate">{user.email}</p>
        </div>
      ) : null}
      <ul className="space-y-1">
        <li><NavLink className={linkClass} to="/home">Browse Items</NavLink></li>
        {user ? <li><NavLink className={linkClass} to="/my-listings">My Listings</NavLink></li> : null}
        {user ? (
          <li>
            <NavLink className={linkClass} to="/wishlist">
              <span className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="text-red-500">♥</span>
                  Wishlist
                </span>
                {wishlistCount ? (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                    {wishlistCount}
                  </span>
                ) : null}
              </span>
            </NavLink>
          </li>
        ) : null}
        {user ? <li><NavLink className={linkClass} to="/dashboard">My Rentals</NavLink></li> : null}
        {isAdmin ? <li><NavLink className={linkClass} to="/admin">Admin Panel</NavLink></li> : null}
        {user ? (
          <li>
            <button
              className="mt-2 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
            >
              Logout
            </button>
          </li>
        ) : (
          <>
            <li><NavLink className={linkClass} to="/login">Login</NavLink></li>
            <li><NavLink className={linkClass} to="/signup">Signup</NavLink></li>
          </>
        )}
      </ul>
    </aside>
  );
}
