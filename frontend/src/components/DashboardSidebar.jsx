import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";
import { getWishlistIds } from "../utils/wishlist";

export default function DashboardSidebar() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const [wishlistCount, setWishlistCount] = useState(() => getWishlistIds(user?.id).length);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
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

  useEffect(() => {
    setProfileName(user?.name || "");
    setProfilePhoto(null);
    setProfileMessage("");
  }, [user]);

  const profileInitial = (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setIsSavingProfile(true);
      setProfileMessage("");
      const formData = new FormData();
      formData.append("name", profileName);
      if (profilePhoto) {
        formData.append("profile_photo", profilePhoto);
      }

      const data = await api.put("/auth/profile", formData);
      updateUser(data.user);
      setIsEditingProfile(false);
      setProfileMessage("Profile updated.");
    } catch (error) {
      setProfileMessage(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <aside className="flex w-full flex-col overflow-hidden border-b border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur md:sticky md:top-0 md:h-screen md:w-72 md:border-b-0 md:border-r">
      <Link to={user ? "/home" : "/"} className="mb-4 flex shrink-0 items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
          UR
        </span>
        <span>
          <span className="block text-xl font-bold tracking-tight">UniRent</span>
          <span className="block text-xs font-medium text-slate-500">Campus rentals</span>
        </span>
      </Link>
      {user ? (
        <div className="mb-3 shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {!isEditingProfile ? (
            <>
              <div className="flex items-center gap-3">
                {user.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt={user.name || "Profile"}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-base font-bold text-white ring-2 ring-white">
                    {profileInitial}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{user.name || "Signed in"}</p>
                  <p className="truncate">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => setIsEditingProfile(true)}
              >
                Edit profile
              </button>
            </>
          ) : (
            <form onSubmit={saveProfile} className="space-y-3">
              <div className="flex items-center gap-3">
                {user.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt={user.name || "Profile"}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-base font-bold text-white ring-2 ring-white">
                    {profileInitial}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{user.email}</p>
                  <p className="text-xs text-slate-500">Profile details</p>
                </div>
              </div>
              <input
                className="field"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Profile name"
              />
              <input
                className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-campus"
                type="file"
                accept="image/*"
                onChange={(event) => setProfilePhoto(event.target.files?.[0] || null)}
              />
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-primary px-3" type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn-secondary px-3"
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileName(user?.name || "");
                    setProfilePhoto(null);
                    setProfileMessage("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          {profileMessage ? <p className="mt-2 text-xs font-semibold text-slate-600">{profileMessage}</p> : null}
        </div>
      ) : null}
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
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
        <li><NavLink className={linkClass} to="/help">Help & Contact</NavLink></li>
        <li><NavLink className={linkClass} to="/checkout">Checkout Flow</NavLink></li>
        <li><NavLink className={linkClass} to="/terms">Terms</NavLink></li>
        <li><NavLink className={linkClass} to="/privacy">Privacy</NavLink></li>
        <li><NavLink className={linkClass} to="/refund-policy">Refund Policy</NavLink></li>
        {!user ? (
          <>
            <li><NavLink className={linkClass} to="/login">Login</NavLink></li>
            <li><NavLink className={linkClass} to="/signup">Signup</NavLink></li>
          </>
        ) : null}
      </ul>
      {user ? (
        <div className="mt-3 shrink-0 border-t border-slate-100 pt-3">
          <button
            className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            onClick={() => {
              logout();
              navigate("/", { replace: true });
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </aside>
  );
}
