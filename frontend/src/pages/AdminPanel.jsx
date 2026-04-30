import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [damageReports, setDamageReports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    users: 0,
    items: 0,
    reviews: 0,
    disputes: 0,
    damageReports: 0,
    avgTrust: 0
  });
  const [message, setMessage] = useState("Loading admin data...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, disputeData, damageReportData, reviewData, statData] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/disputes"),
          api.get("/admin/damage-reports"),
          api.get("/reviews"),
          api.get("/admin/stats")
        ]);

        setUsers(userData);
        setDisputes(disputeData);
        setDamageReports(damageReportData);
        setReviews(reviewData);
        setStats(statData);
        setMessage("");
      } catch (error) {
        setMessage(error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="page-shell">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="label">Platform operations</p>
        <h1 className="mt-1 text-3xl font-bold">Admin Panel</h1>
        {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Users</p>
          <p className="text-2xl font-semibold">{stats.users}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Items</p>
          <p className="text-2xl font-semibold">{stats.items}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Average Trust Score</p>
          <p className="text-2xl font-semibold">{stats.avgTrust}</p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Users</h2>
        {users.map((user) => (
          <div key={user._id} className="border-b py-2 last:border-b-0">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-slate-600">{user.email}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Disputes</h2>
        {disputes.length === 0 ? <p className="text-slate-600">No disputes found.</p> : null}
        {disputes.map((dispute) => (
          <div key={dispute._id} className="border-b py-2 last:border-b-0">
            <p className="font-medium">{dispute.description || "No description"}</p>
            <p className="text-sm text-slate-600">Status: {dispute.status}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
        {reviews.length === 0 ? <p className="text-slate-600">No reviews found.</p> : null}
        {reviews.map((review) => (
          <div key={review._id} className="border-b py-2 last:border-b-0">
            <p className="font-medium">Rating: {review.rating}/5</p>
            <p className="text-sm text-slate-600">{review.comment || "No comment"}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Damage Reports</h2>
        {damageReports.length === 0 ? <p className="text-slate-600">No damage reports found.</p> : null}
        {damageReports.map((report) => (
          <div key={report._id} className="border-b py-3 last:border-b-0">
            <p className="font-medium">{report.description || "No description"}</p>
            <p className="text-sm text-slate-600">Status: {report.status}</p>
            {report.photos?.[0] ? (
              <img
                src={report.photos[0]}
                alt="Damage report"
                className="mt-2 h-32 w-32 rounded object-cover"
              />
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}
