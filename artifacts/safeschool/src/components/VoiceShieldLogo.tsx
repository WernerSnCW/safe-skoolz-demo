interface VoiceShieldLogoProps {
  size?: number;
  className?: string;
}

export function VoiceShieldLogo({ size = 40, className = "" }: VoiceShieldLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M32 4C32 4 8 12 8 28C8 44 20 56 32 60C44 56 56 44 56 28C56 12 32 4 32 4Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M32 4C32 4 8 12 8 28C8 44 20 56 32 60C44 56 56 44 56 28C56 12 32 4 32 4Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 22C16 18.7 18.7 16 22 16H42C45.3 16 48 18.7 48 22V34C48 37.3 45.3 40 42 40H26L18 47V40H22C18.7 40 16 37.3 16 34V22Z"
        fill="currentColor"
        opacity="0.7"
      />
      <circle cx="25" cy="28" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="32" cy="28" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="39" cy="28" r="2.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function VoiceShieldIcon({ size = 24, className = "" }: VoiceShieldLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M32 4C32 4 8 12 8 28C8 44 20 56 32 60C44 56 56 44 56 28C56 12 32 4 32 4Z"
        fill="#0D9488"
      />
      <path
        d="M16 22C16 18.7 18.7 16 22 16H42C45.3 16 48 18.7 48 22V34C48 37.3 45.3 40 42 40H26L18 47V40H22C18.7 40 16 37.3 16 34V22Z"
        fill="white"
        opacity="0.95"
      />
      <circle cx="25" cy="28" r="2.8" fill="#0D9488" opacity="0.6" />
      <circle cx="32" cy="28" r="2.8" fill="#0D9488" opacity="0.6" />
      <circle cx="39" cy="28" r="2.8" fill="#0D9488" opacity="0.6" />
    </svg>
  );
}
