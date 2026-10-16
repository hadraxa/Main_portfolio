import type { ReactElement } from "react";

interface TechIconProps {
  name: string;
  className?: string;
  color?: string;
}

export default function TechIcon({
  name,
  className = "w-6 h-6",
  color,
}: TechIconProps): ReactElement {
  const iconKey = name.toLowerCase();

  switch (iconKey) {
    case "react":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <ellipse cx="12" cy="12" rx="10" ry="4.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        </svg>
      );

    case "nextjs":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9 16V8l8 10V8" />
        </svg>
      );

    case "typescript":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M8 8h5M10.5 8v8" />
          <path d="M14 14.5c.5.5 1.2.9 2 .9 1.1 0 1.8-.6 1.8-1.4 0-1-.8-1.4-1.8-1.7l-.5-.2c-1.3-.4-2.1-1-2.1-2.2 0-1.2 1-2.1 2.5-2.1 1 0 1.8.4 2.3.9" />
        </svg>
      );

    case "javascript":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M9 12v3.5c0 .8-.5 1.5-1.5 1.5M14 14.5c.5.5 1.2.9 2 .9 1.1 0 1.8-.6 1.8-1.4 0-1-.8-1.4-1.8-1.7l-.5-.2c-1.3-.4-2.1-1-2.1-2.2 0-1.2 1-2.1 2.5-2.1 1 0 1.8.4 2.3.9" />
        </svg>
      );

    case "tailwind":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ color }}>
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
        </svg>
      );

    case "html5":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <path d="M4 3l1.8 15.2L12 21l6.2-2.8L20 3H4z" />
          <path d="M7 7h10M7 11h9.5l-.5 4.5L12 17l-4-1.5-.2-2" />
        </svg>
      );

    case "nodejs":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <path d="M12 2l8 4.6v9.2L12 21l-8-4.6V6.6L12 2z" />
          <path d="M12 22V12M12 12L4 7.4M12 12l8-4.6" />
        </svg>
      );

    case "expressjs":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M8 8h8M8 12h6M8 16h8" />
        </svg>
      );

    case "php":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <ellipse cx="12" cy="12" rx="10" ry="6" />
          <path d="M6 10v4M6 10h2.5a2 2 0 0 1 0 4H6M11 10v4M11 12h2.5M16 10v4M16 10h2.5a2 2 0 0 1 0 4H16" />
        </svg>
      );

    case "laravel":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" />
          <path d="M12 4v16M4 8l8 4 8-4" />
        </svg>
      );

    case "api":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <path d="M4 10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z" />
          <path d="M16 8l4 4-4 4M12 12h8" />
        </svg>
      );

    case "postgresql":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <path d="M12 2C6.5 2 2 6.5 2 12c0 3.8 2.2 7.1 5.4 8.7.2.1.4.1.6 0 .5-.3.8-.8.8-1.4v-2c0-.5.4-.9.9-.9h.6c.5 0 .9-.4.9-.9V14c0-.6.4-1 1-1h1.5c.6 0 1 .4 1 1v1.5c0 .5.4.9.9.9h.6c.5 0 .9.4.9.9v2c0 .6.3 1.1.8 1.4.2.1.4.1.6 0C19.8 19.1 22 15.8 22 12c0-5.5-4.5-10-10-10z" />
          <circle cx="9" cy="9" r="1.2" fill="currentColor" />
          <circle cx="15" cy="9" r="1.2" fill="currentColor" />
        </svg>
      );

    case "mysql":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <ellipse cx="12" cy="7" rx="8" ry="3.5" />
          <path d="M4 7v10c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5V7" />
          <path d="M4 12c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5" />
        </svg>
      );

    case "mongodb":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <path d="M12 2C12 2 6 8.5 6 14a6 6 0 0 0 12 0c0-5.5-6-12-6-12z" />
          <path d="M12 2v20" />
        </svg>
      );

    case "sqlserver":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <rect x="3" y="3" width="18" height="6" rx="2" />
          <rect x="3" y="11" width="18" height="6" rx="2" />
          <path d="M7 19h10" />
        </svg>
      );

    case "aws":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <path d="M7 16a4 4 0 0 1-.8-7.9 5.5 5.5 0 0 1 10.6-1.3 4.5 4.5 0 0 1 3.2 5.2A4 4 0 0 1 17 16H7z" />
          <path d="M6 19c4 2 8 2 12 0" />
          <path d="M17 17.5l2 1.5-2 1.5" />
        </svg>
      );

    case "azure":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <path d="M5 19L11 5l4 8h-6z" />
          <path d="M13 14l2-4 4 9H8z" />
        </svg>
      );

    case "oracle":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <rect x="4" y="6" width="16" height="12" rx="6" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );

    case "docker":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <path d="M2 13h20c0 4-3 7-10 7s-10-3-10-7z" />
          <rect x="6" y="9" width="2.5" height="2.5" rx=".5" fill="currentColor" />
          <rect x="9.5" y="9" width="2.5" height="2.5" rx=".5" fill="currentColor" />
          <rect x="13" y="9" width="2.5" height="2.5" rx=".5" fill="currentColor" />
          <rect x="9.5" y="5.5" width="2.5" height="2.5" rx=".5" fill="currentColor" />
          <rect x="13" y="5.5" width="2.5" height="2.5" rx=".5" fill="currentColor" />
        </svg>
      );

    case "git":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="10" r="2.5" />
          <circle cx="6" cy="18" r="2.5" />
          <path d="M6 8.5v7" />
          <path d="M6 13c4 0 6-3 10-3" />
        </svg>
      );

    case "infrastructure":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <rect x="3" y="4" width="18" height="5" rx="1.5" />
          <rect x="3" y="11" width="18" height="5" rx="1.5" />
          <rect x="3" y="18" width="18" height="5" rx="1.5" />
          <circle cx="7" cy="6.5" r="1" fill="currentColor" />
          <circle cx="7" cy="13.5" r="1" fill="currentColor" />
          <circle cx="7" cy="20.5" r="1" fill="currentColor" />
        </svg>
      );

    case "security":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <path d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );

    case "seo":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
          <path d="M8 11h6M11 8v6" />
        </svg>
      );

    case "cms":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={{ color }}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 3" />
        </svg>
      );
  }
}
