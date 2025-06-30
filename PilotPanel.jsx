import React, { useState } from "react";
import axios from "axios";

const PilotPanel = () => {
  const [trainNumber, setTrainNumber] = useState("");
  const [form, setForm] = useState({
  distance_remaining_km: "",
  delay_so_far_min: "",
  weather: "",
  stops_left: "",
  train_type: "",
  hour_of_day: "",
  day_of_week: "",
  station_congestion: "",
  historical_delay_avg: ""
});

  const [predictedDelay, setPredictedDelay] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        distance_remaining_km: parseFloat(form.distance_remaining_km || 0),
        delay_so_far_min: parseInt(form.delay_so_far_min || 0),
        weather: form.weather || "clear",
        stops_left: parseInt(form.stops_left || 0),
        train_type: form.train_type || "express",
        hour_of_day: parseInt(form.hour_of_day || new Date().getHours()),
        day_of_week: form.day_of_week || new Date().toLocaleString("en-US", { weekday: "long" }),
        station_congestion: form.station_congestion || "low",
        historical_delay_avg: parseInt(form.historical_delay_avg || 0),
      };

      const res = await axios.post("http://localhost:5000/predict_delay", payload);
      setPredictedDelay(res.data.predicted_delay);
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Failed to predict delay");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">🚆 Pilot Panel</h1>

      {/* Train Number */}
      <div className="mb-6">
        <label className="block text-lg font-semibold mb-2">Train Number</label>
        <input
          type="text"
          value={trainNumber}
          onChange={(e) => setTrainNumber(e.target.value)}
          placeholder="Enter train number (e.g., 12901)"
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {/* Feature Cards */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather */}
        <div className="bg-white shadow-md rounded p-4">
          <label className="block font-semibold mb-2">Weather Condition</label>
          <select
            name="weather"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1"
            required
          >
            <option value="">Select</option>
            <option value="clear">Clear</option>
            <option value="rain">Rain</option>
            <option value="fog">Fog</option>
          </select>
        </div>

        {/* Stops Left */}
        <div className="bg-white shadow-md rounded p-4">
          <label className="block font-semibold mb-2">Stops Left</label>
          <input
            type="number"
            name="stops_left"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1"
            required
          />
        </div>

        {/* Previous Delay */}
        <div className="bg-white shadow-md rounded p-4">
          <label className="block font-semibold mb-2">Previous Delay (min)</label>
          <input
            type="number"
            name="previous_delay"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1"
            required
          />
        </div>

        {/* Notes */}
        <div className="bg-white shadow-md rounded p-4">
          <label className="block font-semibold mb-2">Additional Notes (Optional)</label>
          <textarea
            name="note"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1"
            rows="3"
            placeholder="Any remarks..."
          />
        </div>

        {/* Submit Button */}
        <div className="col-span-2 text-right mt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Predict Delay
          </button>
        </div>
      </form>

      {/* Prediction Result */}
      {predictedDelay !== null && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Predicted Delay:</strong> {predictedDelay} minutes
        </div>
      )}
    </div>
  );
};

export default PilotPanel;
