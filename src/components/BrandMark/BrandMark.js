import React from "react";

const BrandMark = ({ size = 40, ...props }) => (
  <svg
    role="img"
    aria-label="I Link Digital"
    viewBox="0 0 96 96"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <rect x="4" y="4" width="88" height="88" rx="22" fill="#102A43" />
    <path d="M30 28v40M30 48h36M66 28v40" stroke="#55D6BE" strokeWidth="8" strokeLinecap="round" />
    <circle cx="30" cy="28" r="7" fill="#FF715B" />
    <circle cx="30" cy="68" r="7" fill="#FF715B" />
    <circle cx="66" cy="28" r="7" fill="#F6C85F" />
    <circle cx="66" cy="68" r="7" fill="#F6C85F" />
  </svg>
);

export default BrandMark;