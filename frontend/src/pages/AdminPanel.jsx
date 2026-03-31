import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ users: 0, rentals: 0, disputes: 0, avgTrust: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const u = await axios.get("/admin/users");
      const d = await axios.get("/admin/disputes");
      const r = await axios.get("/reviews");
      const s = await axios.get("/admin/stats"); // backend stats endpoint
      setUsers(u.data);
      setDisputes(d.data);
      setReviews(r.data);
      setStats(s.data);
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {/* Statistics Dashboard */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Platform Statistics</h2>
        <div className="grid grid-cols-2 gap-6">
          <Bar
            data={{
              labels: ["Users", "Rentals", "Disputes"],
              datasets: [
                {
                  label: "Counts",
                  data: [stats.users, stats.rentals, stats.disputes],
                  backgroundColor: ["#3b82f6", "#10b981", "#ef4444"]
                }
              ]
            }}
          />
          <Pie
            data={{
              labels: ["Average Trust Score"],
              datasets: [
                {
                  data: [stats.avgTrust, 100 - stats.avgTrust],
                  backgroundColor: ["#f59e0b", "#d1d5db"]
                }
              ]
            }}
          />
        </div>
      </section>

      {/* Existing Users, Disputes, Reviews sections remain here */}
    </div>
    
  );

  {/* Damage Reports Section */}
<section className="mb-6">
  <h2 className="text-xl font-semibold mb-2">Damage Reports</h2>
  {disputes.map((dr) => (
    <div key={dr._id} className="border p-4 mb-2 rounded">
      <p><b>Rental ID:</b> {dr.rental_id}</p>
      <p><b>Description:</b> {dr.description}</p>
      <p><b>Status:</b> {dr.status}</p>
      <img src={dr.photos[0]} alt="Damage" className="h-32 w-32 object-cover mt-2" />
      <button
        className="bg-red-500 text-white px-3 py-1 mt-2"
        onClick={() => axios.post(`/admin/damage-reports/${dr._id}`, { deduction_amount: 500 })}
      >
        Deduct Deposit
      </button>
    </div>
  ))}
</section>

}
