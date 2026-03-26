import { useState } from "react";
import axios from "axios";

function ChangePassword() {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {

    if (form.newPassword !== form.confirmPassword) {
      return alert("Passwords do not match ❌");
    }

    try {
      setLoading(true);

      await axios.put(
        "http://localhost:5000/api/user/change-password",
        {
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Password updated ✅");

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (err) {
      alert(err.response?.data?.error || "Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-2xl shadow-lg p-6 space-y-6">

      <h2 className="text-2xl font-bold text-stone-800">Change Password</h2>

      <div>
        <label className="text-sm text-stone-600">Old Password</label>
        <input
          type="password"
          name="oldPassword"
          value={form.oldPassword}
          onChange={handleChange}
          className="w-full mt-1 px-4 py-2 border rounded-xl"
        />
      </div>

      <div>
        <label className="text-sm text-stone-600">New Password</label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          className="w-full mt-1 px-4 py-2 border rounded-xl"
        />
      </div>

      <div>
        <label className="text-sm text-stone-600">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full mt-1 px-4 py-2 border rounded-xl"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>

    </div>
  );
}

export default ChangePassword;