import React, { useMemo } from 'react';

interface CosmicBackgroundProps {
  theme: 'light' | 'dark';
}

export function CosmicBackground({ theme }: CosmicBackgroundProps) {
  const isLight = theme === 'light';

  // Generate a deterministic starfield so stars are locked in place and do not flicker on state updates.
  const stars = useMemo(() => {
    const list = [];
    for (let i = 0; i < 120; i++) {
      // Deterministic pseudo-random generation using trigonometry
      const x = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 100);
      const y = Math.abs((Math.cos(i * 78.233) * 43758.5453) % 100);
      
      // Sizes ranging from 0.7px to 2.4px
      const size = 0.6 + ((Math.sin(i * 41.3) + 1) * 0.9);
      // Brightness variation
      const opacity = 0.2 + ((Math.cos(i * 57.1) + 1) * 0.35);
      // Twinkle properties
      const twinkle = i % 4 === 0;
      const twinkleDelay = (i * 0.3) % 5;
      const twinkleDuration = 3 + (i % 4);
      // Saffron/gold vs standard white/silver color accent
      const isGold = i % 5 === 0;

      list.push({
        id: i,
        x,
        y,
        size,
        opacity,
        twinkle,
        twinkleDelay,
        twinkleDuration,
        isGold
      });
    }
    return list;
  }, []);

  // Multi-point constellation paths utilizing percentage coordinates for perfect responsive layout
  const constellations = [
    // Cassiopeia-style shape in top-left
    "M 8% 12% L 13% 18% L 19% 14% L 24% 22% L 30% 16%",
    // Ursa Major-style dipper in top-right
    "M 72% 14% L 78% 13% L 81% 22% L 76% 26% L 72% 14% M 76% 26% L 84% 34% L 91% 32% L 95% 42%",
    // Taurus-style horns in center-right
    "M 55% 40% L 62% 43% L 68% 38% M 62% 43% L 58% 52% L 51% 55% M 58% 52% L 64% 58%",
    // Southern Cross-style in bottom-left
    "M 12% 70% L 18% 85% M 10% 78% L 20% 77%",
    // Zodiac constellation path in bottom-right
    "M 75% 72% L 81% 68% L 86% 74% L 92% 70% L 89% 84% L 80% 88% L 75% 72%"
  ];

  return (
    <div id="cosmic-bg" className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 transition-colors duration-500">
      <style>{`
        @keyframes twinkle-cosmic {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .star-twinkle-effect {
          animation: twinkle-cosmic 5s ease-in-out infinite;
          transform-origin: center;
        }
        .nebula-dark {
          background: 
            radial-gradient(circle at 15% 20%, rgba(30, 27, 75, 0.45) 0%, transparent 60%),
            radial-gradient(circle at 85% 45%, rgba(49, 46, 129, 0.4) 0%, transparent 60%),
            radial-gradient(circle at 50% 85%, rgba(20, 15, 60, 0.55) 0%, transparent 70%),
            radial-gradient(circle at 30% 65%, rgba(245, 158, 11, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 75% 15%, rgba(139, 92, 246, 0.15) 0%, transparent 55%);
          background-color: #03020c;
        }
        .nebula-light {
          background: 
            radial-gradient(circle at 50% -12%, rgba(245, 158, 11, 0.22) 0%, rgba(251, 191, 36, 0.1) 45%, transparent 75%),
            radial-gradient(circle at 10% 40%, rgba(129, 140, 248, 0.15) 0%, transparent 55%),
            radial-gradient(circle at 90% 70%, rgba(244, 114, 182, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 35% 85%, rgba(45, 212, 191, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
          background-color: #FFFDF9;
        }
      `}</style>

      {/* Rich Multi-layered Nebula Background (faded, luxurious transitions) */}
      <div className={`absolute inset-0 w-full h-full transition-all duration-700 ${isLight ? 'nebula-light' : 'nebula-dark'}`} />

      {/* High-Contrast Star & Constellation Map */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="saffronGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Constellation Connection Vectors */}
        {constellations.map((d, index) => (
          <path
            key={`constellation-${index}`}
            d={d}
            fill="none"
            stroke={isLight ? "rgba(180, 83, 9, 0.08)" : "url(#saffronGlow)"}
            strokeWidth={isLight ? "0.65" : "0.85"}
            strokeDasharray="4, 4"
            className="transition-opacity duration-500"
          />
        ))}

        {/* Dense Star Field */}
        {stars.map((star) => {
          // Color selection: gold accents for a mystical vibe, cool whites/indigos for standard stars
          const starColor = isLight
            ? (star.isGold ? 'rgba(180, 83, 9, 0.75)' : 'rgba(99, 102, 241, 0.55)')
            : (star.isGold ? '#f59e0b' : '#e2e8f0');

          return (
            <g key={`star-group-${star.id}`}>
              {/* Twinkling bloom element */}
              {star.twinkle && (
                <circle
                  cx={`${star.x}%`}
                  cy={`${star.y}%`}
                  r={star.size * 2.5}
                  fill={starColor}
                  opacity={star.opacity * 0.45}
                  className="star-twinkle-effect"
                  style={{
                    animationDelay: `${star.twinkleDelay}s`,
                    animationDuration: `${star.twinkleDuration}s`
                  }}
                />
              )}
              {/* Central Star Core */}
              <circle
                cx={`${star.x}%`}
                cy={`${star.y}%`}
                r={star.size}
                fill={starColor}
                opacity={star.opacity}
                className="transition-all duration-500"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

