import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  // ✅ Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Split name (important fix)
  const firstName = user?.name?.split(" ")[0] || "User";
  const lastName = user?.name?.split(" ")[1] || "";

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Logout
  const handleLogout = () => {
    // ✅ Local storage clear
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // ✅ Redirect to login
    navigate("/login");
  };
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-stone-200 px-6 py-3 flex justify-between items-center shadow-sm">
      {/* Left */}
      <h1
        onClick={() => navigate("/dashboard")}
        className="font-bold text-lg text-stone-800 cursor-pointer"
      >
        Lead Dashboard
      </h1>

      {/* Right Profile */}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src={user?.profile || "https://via.placeholder.com/40"}
            alt="profile"
            className="w-9 h-9 rounded-full object-cover border"
          />
          <span className="text-sm font-medium">
            {firstName} {lastName}
          </span>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 bg-white border rounded-xl shadow w-44 overflow-hidden">
            <button
              onClick={() => navigate("/profile")}
              className="block w-full px-4 py-2 text-left hover:bg-stone-100 text-sm"
            >
              👤 Profile
            </button>

            <button
              onClick={() => navigate("/change-password")}
              className="block w-full px-4 py-2 text-left hover:bg-stone-100 text-sm"
            >
              🔒 Change Password
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex w-full px-4 py-2 text-left hover:bg-red-100 text-red-600 text-sm"
            >
              <svg
                className="w-5 h-5 me-2 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
