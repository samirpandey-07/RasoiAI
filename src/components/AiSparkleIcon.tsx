import React from 'react';

interface AiSparkleIconProps {
  className?: string;
  size?: number;
}

/**
 * Signature AI Sparkle Glyph matching the exact 4-point star, top-right plus sparkle,
 * and bottom-left circle dot design.
 */
export const AiSparkleIcon: React.FC<AiSparkleIconProps> = ({
  className = 'w-5 h-5',
  size = 20,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Central 4-point curved star */}
      <path d="M12 2.5C12 7.74671 7.74671 12 2.5 12C7.74671 12 12 16.2533 12 21.5C12 16.2533 16.2533 12 21.5 12C16.2533 12 12 7.74671 12 2.5Z" />
      {/* Top-right sparkle */}
      <path d="M18.5 2C18.5 3.65685 17.1569 5 15.5 5C17.1569 5 18.5 6.34315 18.5 8C18.5 6.34315 19.8431 5 21.5 5C19.8431 5 18.5 3.65685 18.5 2Z" />
      {/* Bottom-left dot */}
      <circle cx="5" cy="18.5" r="1.8" />
    </svg>
  );
};

export const AiSparkleBadge: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/25 ${sizeClasses[size]} ${className}`}
    >
      <AiSparkleIcon size={iconSizes[size]} className="text-white" />
    </div>
  );
};
