import React from 'react';

interface LightningIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function LightningIcon({ size = 24, className, ...props }: LightningIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Precision lightning path: starts top, jags down-left, jags down-right */}
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
    </svg>
  );
}
