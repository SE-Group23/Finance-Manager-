import type React from "react"

interface IconProps {
  className?: string
  size?: number
}

const OutgoingTxnIcon: React.FC<IconProps> = ({ className = "", size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="5" y="4.84299" width="53.3141" height="53.3141" rx="11.1714" fill="#FFE3D5" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M43.7009 38.5583C43.188 38.5213 42.8023 38.0756 42.8392 37.5628L44.0453 20.823L27.2622 20.8585C26.748 20.8596 26.3303 20.4436 26.3293 19.9295C26.3282 19.4153 26.7441 18.9977 27.2582 18.9966L45.044 18.959C45.3028 18.9584 45.5502 19.0657 45.7268 19.255C45.9033 19.4444 45.9931 19.6986 45.9745 19.9568L44.6963 37.6966C44.6594 38.2094 44.2137 38.5952 43.7009 38.5583Z"
      fill="#F11818"
      stroke="#F11818"
      strokeWidth="3.35142"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M44.3651 20.5248C44.7157 20.9008 44.6952 21.4899 44.3191 21.8406L19.8084 44.6972C19.4324 45.0478 18.8433 45.0273 18.4927 44.6512C18.142 44.2752 18.1626 43.6861 18.5386 43.3355L43.0493 20.4789C43.4254 20.1282 44.0144 20.1488 44.3651 20.5248Z"
      fill="#F11818"
      stroke="#F11818"
      strokeWidth="3.35142"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default OutgoingTxnIcon
