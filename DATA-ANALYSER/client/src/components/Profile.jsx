import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
function Profile() {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    email: "",
    profile: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm(res.data);
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("name", form.name);

    if (file) formData.append("profile", file);

    try {
      setLoading(true);

      const res = await axios.put(
        "http://localhost:5000/api/user/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Profile updated");
    } catch {
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-stone-800">Profile Settings</h2>

      {/* Image */}
      <div className="flex items-center gap-5">
        <img
          src={
            file
              ? URL.createObjectURL(file)
              : form.profile || "https://via.placeholder.com/100"
          }
          className="w-20 h-20 rounded-full object-cover border"
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      </div>

      {/* Name */}
      <div>
        <label className="text-sm text-stone-600">Full Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-sm text-stone-600">Email</label>
        <input
          value={form.email}
          disabled
          className="w-full mt-1 px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>
    </div>
  );
}

export default Profile;
