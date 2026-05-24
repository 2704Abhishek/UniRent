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
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-ink text-lg font-bold text-white">
          UR
        </div>
        <p className="label mt-6">Welcome to UniRent</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Start with your account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in to manage rentals or create an account to list and borrow campus items.
        </p>
        <div className="mt-7 grid gap-3">
          <Link className="btn-primary w-full" to="/login">Sign in</Link>
          <Link className="btn-secondary w-full" to="/signup">Sign up</Link>
        </div>
        <div className="mt-6 border-t border-slate-100 pt-5 text-left">
          <p className="text-sm font-semibold text-ink">What customers can do</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <p>Browse listed products, rent one item at a time, and pay rent plus refundable deposit through checkout.</p>
            <p>Return items through OTP confirmation, then track refund or deduction status from My Rentals.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs font-semibold text-campus">
          <Link to="/home">Product listings</Link>
          <Link to="/checkout">Checkout flow</Link>
          <Link to="/help">Contact support</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/refund-policy">Refund policy</Link>
        </div>
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
