import React from 'react';

const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full transition"
  >
    {children}
  </button>
);

export default Button;
