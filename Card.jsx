import React from 'react';

const Card = ({ title, info }) => (
  <div className="w-80 bg-white shadow-md hover:shadow-xl rounded-lg p-4 transition">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-700">{info}</p>
  </div>
);

export default Card;
