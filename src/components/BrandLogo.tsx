import React from 'react';

export const BrandLogo: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-9 h-9',
  size = 36,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl bg-[#163828] text-white flex items-center justify-center shrink-0 shadow-xs ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-[#FAF7F2]"
      >
        {/* Leaf sprout & culinary cross emblem */}
        <path d="M12 2a5 5 0 0 0-5 5c0 3 5 7 5 7s5-4 5-7a5 5 0 0 0-5-5Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M2 12a5 5 0 0 0 5 5c3 0 7-5 7-5s-4-5-7-5a5 5 0 0 0-5 5Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M22 12a5 5 0 0 1-5 5c-3 0-7-5-7-5s4-5 7-5a5 5 0 0 1 5 5Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M12 22a5 5 0 0 1-5-5c0-3 5-7 5-7s5 4 5 7a5 5 0 0 1-5 5Z" fill="currentColor" fillOpacity="0.15" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
};
