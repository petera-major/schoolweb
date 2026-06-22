export function ScribbleUnderline({ color = "var(--orange)" }: { color?: string }) {
  return (
    <svg viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M3 14C40 6 80 18 100 9C130 -3 160 15 197 8"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SunDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="40" cy="40" r="14" stroke="var(--orange)" strokeWidth="3" fill="none" />
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const x1 = 40 + Math.cos(angle) * 20;
        const y1 = 40 + Math.sin(angle) * 20;
        const x2 = 40 + Math.cos(angle) * 32;
        const y2 = 40 + Math.sin(angle) * 32;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--orange)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function CloudDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 50"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 38C9 38 4 30 9 23C5 14 16 7 25 11C29 3 44 2 49 11C60 7 71 15 68 24C76 26 76 38 65 38Z"
        stroke="var(--sky-dark)"
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartDoodle({ className = "", color = "var(--pink)" }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 80 70"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 62C40 62 6 40 6 18C6 5 18 1 27 7C33 11 40 19 40 19C40 19 47 11 53 7C62 1 74 5 74 18C74 40 40 62 40 62Z"
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarDoodle({ className = "", color = "var(--yellow)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 2L24 16L38 20L24 24L20 38L16 24L2 20L16 16Z"
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleX({ className = "", color = "var(--sky-dark)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L20 20M20 4L4 20" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function SquiggleDivider({ color = "var(--orange)" }: { color?: string }) {
  return (
    <svg viewBox="0 0 400 16" fill="none" className="w-full" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 8C20 -2 40 18 60 8C80 -2 100 18 120 8C140 -2 160 18 180 8C200 -2 220 18 240 8C260 -2 280 18 300 8C320 -2 340 18 360 8C375 2 388 12 398 8"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
