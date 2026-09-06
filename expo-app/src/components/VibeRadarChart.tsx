import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Polygon,
  Line,
  Circle,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

export type VibeRadarProps = {
  humor?: number;
  energy?: number;
  lifestyle?: number;
  weekend?: number;
  loveLanguage?: number;
  firstStep?: number;
  size?: number;
  glow?: boolean;
};

export function VibeRadarChart({
  humor = 50,
  energy = 50,
  lifestyle = 50,
  weekend = 50,
  loveLanguage = 50,
  firstStep = 50,
  size = 260,
  glow = true,
}: VibeRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.33; // Maximum radius for the outer hexagon

  // 6 dimensions - 6 vertices forming a perfect Hexagon (Altıgen)
  // Step is 60 degrees
  const dimensions = [
    { label: "Mizah", value: humor, angle: -90 },
    { label: "Enerji", value: energy, angle: -30 },
    { label: "Yaşam Tarzı", value: lifestyle, angle: 30 },
    { label: "Hafta Sonu", value: weekend, angle: 90 },
    { label: "Sevgi Dili", value: loveLanguage, angle: 150 },
    { label: "İlk Adım", value: firstStep, angle: 210 },
  ];

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Concentric Hexagonal grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const gridHexagons = gridLevels.map((lvl) => {
    return dimensions
      .map((d) => {
        const x = cx + r * lvl * Math.cos(toRad(d.angle));
        const y = cy + r * lvl * Math.sin(toRad(d.angle));
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  });

  // User Hexagonal Data Polygon Points
  const dataPoints = dimensions.map((d) => {
    const norm = Math.max(20, Math.min(100, d.value)) / 100;
    const x = cx + r * norm * Math.cos(toRad(d.angle));
    const y = cy + r * norm * Math.sin(toRad(d.angle));
    return { x, y, value: d.value };
  });

  const dataPolygon = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <View
      style={[
        styles.baseContainer,
        glow && styles.glowShadow,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          {/* Outward Neon Pink Radial Gradient for Hexagon Data Fill */}
          <RadialGradient id="neonPinkFill" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#FF007F" stopOpacity="0.45" />
            <Stop offset="70%" stopColor="#FF007F" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#FF007F" stopOpacity="0.08" />
          </RadialGradient>
        </Defs>

        {/* Inner Concentric Hexagons (Altıgen Izgaralar) */}
        {gridHexagons.map((points, idx) => {
          const isOuter = idx === 3;
          return (
            <Polygon
              key={`hex-grid-${idx}`}
              points={points}
              fill={isOuter ? (glow ? "rgba(255, 0, 127, 0.02)" : "rgba(139, 92, 246, 0.02)") : "none"}
              stroke={isOuter ? (glow ? "rgba(255, 0, 127, 0.45)" : "#3f3f46") : "#27272a"}
              strokeWidth={isOuter ? "1.5" : "0.8"}
              strokeDasharray={isOuter ? "none" : "3,3"}
            />
          );
        })}

        {/* 6 Radial Axis Lines (Merkezden altıgenin köşelerine) */}
        {dimensions.map((d, idx) => {
          const x2 = cx + r * Math.cos(toRad(d.angle));
          const y2 = cy + r * Math.sin(toRad(d.angle));
          return (
            <Line
              key={`axis-${idx}`}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="#3f3f46"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
          );
        })}

        {/* OUTWARD NEON GLOW LAYERS (Only active when glow = true) */}
        {glow && (
          <>
            {/* Layer 1: Wide Soft Outward Halo */}
            <Polygon
              points={dataPolygon}
              fill="none"
              stroke="#FF007F"
              strokeWidth="14"
              strokeOpacity="0.12"
              strokeLinejoin="round"
            />

            {/* Layer 2: Medium Vibrant Neon Glow */}
            <Polygon
              points={dataPolygon}
              fill="none"
              stroke="#FF007F"
              strokeWidth="7"
              strokeOpacity="0.30"
              strokeLinejoin="round"
            />

            {/* Layer 3: Concentrated Glow Line */}
            <Polygon
              points={dataPolygon}
              fill="none"
              stroke="#FF007F"
              strokeWidth="3.5"
              strokeOpacity="0.6"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* Hexagon Fill */}
        <Polygon
          points={dataPolygon}
          fill={glow ? "url(#neonPinkFill)" : "rgba(139, 92, 246, 0.18)"}
          stroke="none"
        />

        {/* Main Sharp Thin Stroke */}
        <Polygon
          points={dataPolygon}
          fill="none"
          stroke={glow ? "#FF007F" : "#a78bfa"}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Inner Crisp Fine Highlight */}
        {glow && (
          <Polygon
            points={dataPolygon}
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.85"
            strokeLinejoin="round"
          />
        )}

        {/* Hexagon Vertices / Data Points */}
        {dataPoints.map((p, idx) => (
          <React.Fragment key={`dot-${idx}`}>
            {glow ? (
              <>
                {/* Outward glowing halo */}
                <Circle cx={p.x} cy={p.y} r="7" fill="#FF007F" fillOpacity="0.3" />
                {/* Vibrant pink mid ring */}
                <Circle cx={p.x} cy={p.y} r="4" fill="#FF007F" />
                {/* Crisp white center dot */}
                <Circle cx={p.x} cy={p.y} r="1.8" fill="#ffffff" />
              </>
            ) : (
              <Circle cx={p.x} cy={p.y} r="3" fill="#a78bfa" />
            )}
          </React.Fragment>
        ))}

        {/* Axis Labels (Altıgenden daha uzakta ve daha büyük font) */}
        {dimensions.map((d, idx) => {
          const labelDist = r + 26; // Radardan daha uzağa yerleştirildi
          const lx = cx + labelDist * Math.cos(toRad(d.angle));
          const ly = cy + labelDist * Math.sin(toRad(d.angle)) + 4;
          return (
            <SvgText
              key={`label-${idx}`}
              x={lx}
              y={ly}
              fill="#f4f4f5"
              fontSize="11.5"
              fontWeight="800"
              textAnchor="middle"
              letterSpacing="0.4"
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowShadow: {
    shadowColor: "#FF007F",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 14,
    shadowOpacity: 0.9,
    elevation: 10,
  },
});
