// File: src/pages/LoginSignupPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginSignupPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "",
    role: "user",
    token: "", // used for login only
  });
  const [generatedToken, setGeneratedToken] = useState("");
  const navigate = useNavigate();


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const url = isLogin
    ? "http://localhost:5000/login"
    : "http://localhost:5000/signup";

  try {
    const payload = isLogin
      ? { token: form.token }
      : { username: form.username, role: form.role };

    const res = await axios.post(url, payload); // ✅ define res first

    if (!isLogin) {
      setGeneratedToken(res.data.token); // ✅ now this works
      alert(`Signup successful! Your access token is: ${res.data.token}`);
    } else {
      alert(res.data.message);
    }

    if (res.data.token) {
  localStorage.setItem("auth_token", res.data.token);
  localStorage.setItem("role", res.data.role);

  // ✅ Redirect based on role
  switch (res.data.role) {
    case "pilot":
      navigate("/pages/PilotPanel");
      break;
    case "station_master":
      navigate("/pages/StationDashboard");
      break;
    case "user":
    default:
      navigate("/pages/user");
      break;
  }
}

  } catch (err) {
    alert(err.response?.data?.error || "Signup failed");
    console.error(err);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">
          {isLogin ? "Login" : "Signup"} to SaarthiRail
        </h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                required
                className="w-full px-3 py-2 mb-3 border rounded"
              />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 mb-3 border rounded"
              >
                <option value="user">Normal User</option>
                <option value="pilot">Loco Pilot</option>
                <option value="station_master">Station Master</option>
              </select>
            </>
          )}

          {isLogin && (
            <input
              type="text"
              name="token"
              value={form.token}
              onChange={handleChange}
              placeholder="Enter your 8-digit access key"
              required
              className="w-full px-3 py-2 mb-3 border rounded"
            />
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>
        {generatedToken && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <strong>Your Access Token:</strong> {generatedToken} <br />
            <span className="text-sm text-gray-600">
              Save this token securely. You'll need it to login later.
            </span>
          </div>
        )}

        
        <p className="text-sm text-center mt-3">
          {isLogin ? "Don't" : "Already"} have an account?{' '}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 cursor-pointer"
          >
            {isLogin ? "Signup" : "Login"} here
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginSignupPage;
