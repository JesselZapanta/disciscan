export default function Logo({ className = '', size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield background */}
      <path
        d="M20 2L5 10v10c0 8.25 6.75 15.75 15 18 8.25-2.25 15-9.75 15-18V10L20 2z"
        fill="#151A21"
        stroke="#F5A623"
        strokeWidth="1.5"
      />
      {/* Inner shield line */}
      <path
        d="M20 5.5L8 12v8.5c0 6.75 5.25 12.75 12 14.5 6.75-1.75 12-7.75 12-14.5V12L20 5.5z"
        fill="#0D1117"
        stroke="#F5A623"
        strokeWidth="0.75"
        opacity="0.5"
      />
      {/* Checkmark icon */}
      <path
        d="M16 21l3 3 6-7"
        stroke="#2ECC71"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
