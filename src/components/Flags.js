// Banderas en SVG inline: los emojis de bandera no se ven en Windows.
const flags = {
  es: (
    <>
      <rect width="60" height="40" fill="#c60b1e" />
      <rect y="10" width="60" height="20" fill="#ffc400" />
    </>
  ),
  en: (
    <>
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#c8102e" strokeWidth="3" />
      <path d="M30 0V40M0 20H60" stroke="#fff" strokeWidth="13" />
      <path d="M30 0V40M0 20H60" stroke="#c8102e" strokeWidth="8" />
    </>
  ),
  nb: (
    <>
      <rect width="60" height="40" fill="#ba0c2f" />
      <path d="M20 0V40M0 20H60" stroke="#fff" strokeWidth="12" />
      <path d="M20 0V40M0 20H60" stroke="#00205b" strokeWidth="6" />
    </>
  ),
};

export default function Flag({ codigo, className }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={className}
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      {flags[codigo]}
    </svg>
  );
}
