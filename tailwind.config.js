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
        // Primary Colors - Deep forest green palette
        primary: {
          DEFAULT: "#2D5A3D", // Deep forest green
          50: "#F0F7F2", // Very light forest green
          100: "#D4E8DA", // Light forest green
          200: "#A9D1B5", // Medium light forest green
          300: "#7EBA90", // Medium forest green
          400: "#53A36B", // Medium dark forest green
          500: "#2D5A3D", // Deep forest green - base
          600: "#244B32", // Darker forest green
          700: "#1B3C27", // Very dark forest green
          800: "#122D1C", // Ultra dark forest green
          900: "#091E11", // Deepest forest green
        },

        // Secondary Colors - Fresh sage green palette
        secondary: {
          DEFAULT: "#7BA05B", // Fresh sage green
          50: "#F4F7F0", // Very light sage
          100: "#E6EFD9", // Light sage
          200: "#CDDEB3", // Medium light sage
          300: "#B4CE8D", // Medium sage
          400: "#9BB767", // Medium dark sage
          500: "#7BA05B", // Fresh sage green - base
          600: "#6A8A4F", // Darker sage
          700: "#597443", // Very dark sage
          800: "#485E37", // Ultra dark sage
          900: "#37482B", // Deepest sage
        },

        // Accent Colors - Warm amber palette
        accent: {
          DEFAULT: "#F4A261", // Warm amber
          50: "#FEF7F0", // Very light amber
          100: "#FDEBD3", // Light amber
          200: "#FBD7A7", // Medium light amber
          300: "#F9C37B", // Medium amber
          400: "#F7AD4F", // Medium dark amber
          500: "#F4A261", // Warm amber - base
          600: "#E08B3A", // Darker amber
          700: "#CC7413", // Very dark amber
          800: "#A65E0F", // Ultra dark amber
          900: "#80470B", // Deepest amber
        },

        // Background Colors
        background: "#FEFEFE", // Pure white
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
          primary: "#1A1A1A", // Near-black
          secondary: "#6B7280", // Medium gray
          tertiary: "#9CA3AF", // Light gray
          inverse: "#FFFFFF", // White text
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
        // Headings - Inter
        heading: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],

        // Body - Source Sans Pro
        body: ["Source Sans Pro", "sans-serif"],

        // Captions - Nunito Sans
        caption: ["Nunito Sans", "sans-serif"],

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
        organic: "0 4px 12px rgba(45, 90, 61, 0.08)",
        "organic-hover": "0 8px 24px rgba(45, 90, 61, 0.12)",
        soft: "0 2px 8px rgba(0, 0, 0, 0.05)",
        medium: "0 4px 16px rgba(0, 0, 0, 0.08)",
        large: "0 8px 32px rgba(0, 0, 0, 0.12)",
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
