export const theme = {
  colors: {
    primary: "#0D173C", // Navy
    accent: "#4EA8DE", // Sky Blue
    accentLight: "#7BC4E8",
    primaryLight: "#1A2B5F",
    primaryDark: "#070C1F",
    surface: "#FFFFFF",
    muted: "#F3F6F9",
    border: "#E6EEF6",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
  },
  spacing: {
    base: 8,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const

export type Theme = typeof theme
