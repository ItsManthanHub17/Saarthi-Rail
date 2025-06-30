import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const recentUpdates = [
  {
    title: 'Vande Bharat now connects 5 more cities!',
    info: 'Indian Railways expands its premium train service.',
  },
  {
    title: 'Monsoon Timetable Released',
    info: 'Special schedule to manage delays and flooding.',
  },
  {
    title: 'Platform Ticket Prices Revised',
    info: 'Fare hiked in major stations to reduce crowd.',
  },
];

const HomePage = () => {
  const [authMode, setAuthMode] = useState('login');
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authMode === 'signup') {
      await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });
    } else {
      await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });
    }
    alert(`${authMode === 'signup' ? 'Signed up' : 'Logged in'} as ${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="text-center text-5xl font-bold text-indigo-700 py-8"
      >
        SaarthiRail 🚆
      </motion.h1>

      <nav className="flex justify-between px-10 py-4 bg-indigo-800 text-white shadow-md sticky top-0 z-50">
        <div className="font-semibold text-lg">SaarthiRail</div>
        <div className="space-x-4">
          <button className="hover:underline">About</button>
          <button className="hover:underline">Contact</button>
          <button onClick={() => setAuthMode('login')}>Login</button>
          <button onClick={() => setAuthMode('signup')}>Sign Up</button>
        </div>
      </nav>

      <div className="flex justify-center flex-wrap gap-4 p-6">
        {recentUpdates.map((update, idx) => (
          <Card key={idx} title={update.title} info={update.info} />
        ))}
      </div>

      <div className="max-w-md mx-auto bg-white p-6 mt-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-4 capitalize">{authMode}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            className="w-full p-2 border rounded"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <select
            className="w-full p-2 border rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="pilot">Loco Pilot</option>
            <option value="station_master">Station Master</option>
            <option value="user">User</option>
          </select>
          <Button type="submit">
            {authMode === 'login' ? 'Login' : 'Sign Up'} as {role.replace('_', ' ')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
