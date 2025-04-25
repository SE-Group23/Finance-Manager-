import type React from "react"

interface IconProps {
  className?: string
  size?: number
}

const IncomingTxnIcon: React.FC<IconProps> = ({ className = "", size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="5" y="5.745" width="53.51" height="53.51" rx="11.2125" fill="#D5FFEE" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.5756 25.2033C21.0903 25.2404 21.4775 25.6877 21.4404 26.2024L20.2298 43.0038L37.0747 42.9682C37.5907 42.9671 38.0099 43.3845 38.011 43.9005C38.0121 44.4166 37.5947 44.8358 37.0786 44.8369L19.2275 44.8746C18.9677 44.8752 18.7194 44.7675 18.5422 44.5775C18.365 44.3875 18.2749 44.1322 18.2936 43.8731L19.5765 26.0681C19.6136 25.5534 20.0609 25.1662 20.5756 25.2033Z"
      fill="#26FAA9"
      stroke="#26FAA9"
      strokeWidth="3.36374"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.909 43.303C19.557 42.9256 19.5777 42.3344 19.9551 41.9825L44.5559 19.0418C44.9333 18.6899 45.5246 18.7105 45.8765 19.0879C46.2284 19.4653 46.2078 20.0566 45.8304 20.4085L21.2296 43.3492C20.8522 43.7011 20.2609 43.6805 19.909 43.303Z"
      fill="#26FAA9"
      stroke="#26FAA9"
      strokeWidth="3.36374"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default IncomingTxnIcon
