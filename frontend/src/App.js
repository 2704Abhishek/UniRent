import { useContext } from "react";
import { BrowserRouter as Router, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import CustomerAssistant from "./components/CustomerAssistant";
import DashboardSidebar from "./components/DashboardSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContext } from "./context/AuthContext";
import AdminPanel from "./pages/AdminPanel";
import CheckoutInfo from "./pages/CheckoutInfo";
import Dashboard from "./pages/Dashboard";
import Help from "./pages/Help";
import Home from "./pages/Home";
import ItemDetails from "./pages/ItemDetails";
import { PrivacyPolicy, RefundCancellationPolicy, TermsAndConditions } from "./pages/LegalPages";
import Login from "./pages/Login";
import MyListings from "./pages/MyListings";
import Signup from "./pages/Signup";
import Wishlist from "./pages/Wishlist";

function AuthWelcome() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-ink text-lg font-bold text-white">
          UR
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Welcome to UniRent</h1>
        <div className="mt-6 grid gap-3">
          <Link className="btn-primary w-full" to="/login">Sign in</Link>
          <Link className="btn-secondary w-full" to="/signup">Sign up</Link>
        </div>
        <p className="mt-5 border-t border-slate-100 pt-4 text-sm font-medium leading-6 text-slate-600">
          Find what you need, share what you have, and keep campus rentals simple.
        </p>
      </section>
    </div>
  );
}

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AppLayout() {
  const location = useLocation();
  const isAuthPage = ["/", "/login", "/signup"].includes(location.pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <Routes>
          <Route path="/" element={<AuthWelcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink md:flex">
      <DashboardSidebar />
      <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/my-listings"
            element={(
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/wishlist"
            element={(
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            )}
          />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Help />} />
          <Route path="/checkout" element={<CheckoutInfo />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundCancellationPolicy />} />
          <Route path="/items/:id" element={<ItemDetails />} />
          <Route
            path="/admin"
            element={(
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            )}
          />
        </Routes>
      </main>
      <CustomerAssistant />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
