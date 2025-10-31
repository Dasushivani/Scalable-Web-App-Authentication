import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function Dashboard() {
  const navigate = useNavigate();
  const goToNotes = () => {
  navigate("/notes");
};
  const [profile, setProfile] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/"); // Redirect to login if no token
      return;
    }

    fetch("http://localhost:5000/api/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched profile:", data); // ✅ Debug log
        setProfile(data);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        navigate("/"); // Redirect to login on error
      });
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100">
      <h1 className="text-3xl font-bold text-green-700 mb-4">
        Welcome, {profile.name || "User"}! 🎉
      </h1>
      <p className="text-gray-700 mb-6">Logged in as: {profile.email}</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
      <button
  onClick={goToNotes}
  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition mt-4"
>
  Go to Notes 📝
</button>
    </div>
  );
}

export default Dashboard;