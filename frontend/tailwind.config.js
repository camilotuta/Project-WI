module.exports = {
  content: [
    "./pages/*.{html,js}",
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./components/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - GYMARK Brand #070709
        primary: {
          DEFAULT: "#070709", // GYMARK near-black
          50: "#FEFEFE", // GYMARK white
          100: "#EAEAEA", // Very light gray
          200: "#D1D1D1", // Light gray
          300: "#A8A8A8", // Medium gray
          400: "#707070", // Medium dark gray
          500: "#070709", // GYMARK near-black - base
          600: "#050507", // Darker
          700: "#030304", // Very dark
          800: "#020202", // Ultra dark
          900: "#000000", // Pure black
        },

        // Secondary Colors - Dark charcoal scale
        secondary: {
          DEFAULT: "#2C2C2E", // Dark charcoal
          50: "#F5F5F5", // Very light
          100: "#E8E8E8", // Light
          200: "#CFCFD0", // Medium light
          300: "#AEAEB2", // Medium
          400: "#6C6C70", // Medium dark
          500: "#2C2C2E", // Dark charcoal - base
          600: "#1E1E20", // Darker
          700: "#141416", // Very dark
          800: "#0D0D0F", // Ultra dark
          900: "#070709", // Deepest
        },

        // Accent Colors - Mid gray
        accent: {
          DEFAULT: "#636366", // Mid gray
          50: "#F5F5F5", // Very light
          100: "#E8E8E8", // Light
          200: "#D0D0D0", // Medium light
          300: "#AEAEB2", // Medium
          400: "#8E8E93", // Medium dark
          500: "#636366", // Mid gray - base
          600: "#48484A", // Darker
          700: "#3A3A3C", // Very dark
          800: "#2C2C2E", // Ultra dark
          900: "#1C1C1E", // Deepest
        },

        // Background Colors
        background: "#FEFEFE", // GYMARK white principal
        surface: {
          DEFAULT: "#F8F9FA", // Subtle warm gray
          50: "#FFFFFF", // Pure white
          100: "#F8F9FA", // Subtle warm gray - base
          200: "#E9ECEF", // Light gray
          300: "#DEE2E6", // Medium light gray
          400: "#CED4DA", // Medium gray
          500: "#ADB5BD", // Medium dark gray
        },

        // Text Colors
        text: {
          primary: "#070709", // GYMARK near-black
          secondary: "#636366", // Medium gray
          tertiary: "#AEAEB2", // Light gray
          inverse: "#FEFEFE", // GYMARK white text
        },

        // Status Colors
        success: {
          DEFAULT: "#059669", // Vibrant green
          50: "#ECFDF5", // Very light success green
          100: "#D1FAE5", // Light success green
          200: "#A7F3D0", // Medium light success green
          300: "#6EE7B7", // Medium success green
          400: "#34D399", // Medium dark success green
          500: "#059669", // Vibrant green - base
          600: "#047857", // Darker success green
          700: "#065F46", // Very dark success green
        },

        warning: {
          DEFAULT: "#D97706", // Amber orange
          50: "#FFFBEB", // Very light warning
          100: "#FEF3C7", // Light warning
          200: "#FDE68A", // Medium light warning
          300: "#FCD34D", // Medium warning
          400: "#FBBF24", // Medium dark warning
          500: "#D97706", // Amber orange - base
          600: "#B45309", // Darker warning
          700: "#92400E", // Very dark warning
        },

        error: {
          DEFAULT: "#DC2626", // Clear red
          50: "#FEF2F2", // Very light error
          100: "#FEE2E2", // Light error
          200: "#FECACA", // Medium light error
          300: "#FCA5A5", // Medium error
          400: "#F87171", // Medium dark error
          500: "#DC2626", // Clear red - base
          600: "#B91C1C", // Darker error
          700: "#991B1B", // Very dark error
        },

        // Border Colors
        border: {
          DEFAULT: "#E5E7EB", // Light gray border
          light: "#F3F4F6", // Very light border
          dark: "#D1D5DB", // Medium border
        },

        // Gray Scale (for compatibility)
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },

      fontFamily: {
        // Headings - Bebas Neue (bold, condensed like the GYMARK logo)
        heading: ["Bebas Neue", "Barlow Condensed", "sans-serif"],
        sans: ["Barlow", "sans-serif"],

        // Body - Barlow (clean, athletic)
        body: ["Barlow", "sans-serif"],

        // Captions - Barlow Condensed
        caption: ["Barlow Condensed", "sans-serif"],

        // Data/Mono - JetBrains Mono
        mono: ["JetBrains Mono", "monospace"],
        data: ["JetBrains Mono", "monospace"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },

      boxShadow: {
        organic: "0 4px 12px rgba(0, 0, 0, 0.10)",
        "organic-hover": "0 8px 24px rgba(0, 0, 0, 0.18)",
        soft: "0 2px 8px rgba(0, 0, 0, 0.05)",
        medium: "0 4px 16px rgba(0, 0, 0, 0.08)",
        large: "0 8px 32px rgba(0, 0, 0, 0.14)",
      },

      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },

      transitionDuration: {
        micro: "200ms",
        state: "300ms",
      },

      letterSpacing: {
        tightest: "-0.02em",
        tight: "0em",
        normal: "0.015em",
        wide: "0.04em",
        wider: "0.08em", // headings (Bebas Neue)
        widest: "0.12em", // uppercase labels
      },

      transitionTimingFunction: {
        micro: "ease-out",
        state: "ease-in-out",
      },

      animation: {
        "pulse-gentle": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 300ms ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },

      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-balance": {
          "text-wrap": "balance",
        },
        ".transition-micro": {
          transition: "all 200ms ease-out",
        },
        ".transition-state": {
          transition: "all 300ms ease-in-out",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
