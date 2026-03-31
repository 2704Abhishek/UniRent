import { Link } from "react-router-dom";

export default function DashboardSidebar() {
  return (
    <div className="w-64 bg-gray-100 p-4 h-screen">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <ul className="space-y-2">
        <li><Link to="/dashboard">My Rentals</Link></li>
        <li><Link to="/admin">Admin Panel</Link></li>
        <li><Link to="/reviews">Reviews</Link></li>
      </ul>
    </div>
  );
}
