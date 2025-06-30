import React, { useEffect, useState } from "react";
import axios from "axios";
// import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
export const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white shadow-md rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = "" }) => {
  return <div className={`text-gray-800 ${className}`}>{children}</div>;
};

const StationDashboard = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await axios.get("http://localhost:5000/get_schedule");
      setSchedule(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching platform schedule:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading platform data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Station Master Panel</h1>

      {Object.entries(schedule).map(([platform, trains], index) => (
        <motion.div
          key={platform}
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <h2 className="text-2xl font-semibold mb-4">{platform}</h2>

          {trains.length === 0 ? (
            <p className="text-gray-600">No trains scheduled on this platform.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trains.map((train, i) => (
                <Card key={i} className="shadow-md border-l-4 border-blue-500">
                  <CardContent className="p-4">
                    <p><strong>Train Number:</strong> {train.train_id}</p>
                    <p><strong>Arrival:</strong> {train.arrival}</p>
                    <p><strong>Departure:</strong> {train.departure}</p>
                    <p><strong>Direction:</strong> {train.direction}</p>
                    <p><strong>Platform:</strong> {train.platform}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default StationDashboard;
