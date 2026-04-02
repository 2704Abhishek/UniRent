import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ItemDetails from "./pages/ItemDetails";
import AdminPanel from "./pages/AdminPanel";
import DashboardSidebar from "./components/DashboardSidebar";

function App() {
  return (
    <Router>
      <div className="flex">
        {/* Sidebar on the left */}
        <DashboardSidebar />

        {/* Main content area */}
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
