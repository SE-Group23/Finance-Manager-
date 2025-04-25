/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                "primary-dark": "#003c36",
                "primary-medium": "#004a42",
                "primary-light": "#006e5f",
                "primary-lighter": "#00806c",
                "background-light": "#f0f8e8",
                "finapp-teal": {
                    DEFAULT: "#00897b",
                    dark: "#00695c",
                },
                "finapp-green": "#00C853",
                navbar: "#2D907A",
                "navbar-dark": "#24806c",
                "chatbot-highlight": "#E2FF54",
                "box-color": "#F9FFDA",
                'finapp-teal': {
                    DEFAULT: '#00897b',
                    dark: '#00695c',
                },
                calendar: {
                    teal: "#004052",
                    mint: "#e8f5f0",
                    highlight: "#DDFF71",
                    event: "#FFD6A5",
                    urgent: "#FF6B6B",
                },
                'finapp-green': '#00C853',
                ...require('tailwindcss/colors'),
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                inter: ["Inter", "sans-serif"],
            },
            animation: {
                "spin-slow": "spin 8s linear infinite",
                "fade-in": "fade-in 0.6s ease-out forwards",
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                    'spin-slow': 'spin 8s linear infinite',
                    'fade-in': 'fade-in 0.6s ease-out forwards',
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "primary-dark": "#003c36",
        //"primary-medium": "#004a42",
        "primary-medium": "#004852", //updated
        "primary-light": "#006e5f",
        "primary-lighter": "#00806c",
        "background-light": "#f0f8e8",
        //"background-light": "#ECF6F3", //updated
        "finapp-teal": {
          DEFAULT: "#00897b",
          dark: "#00695c",
        },
        //"finapp-green": "#00C853",
        "finapp-green": "#09FB72", // Updated to the requested color
        "finapp-red": "#FF7A7A", // Added for expenses
        "header-blue": "#00152E", // Added for transactions header
        "date-orange": "#E29578", // Added for date text
        navbar: "#2D907A",
        "navbar-dark": "#24806c",
        "chatbot-highlight": "#E2FF54",
        "box-color": "#F9FFDA",
        'finapp-teal': {
          DEFAULT: '#00897b',
          dark: '#00695c',
        },
        //'finapp-green': '#00C853',
        ...require('tailwindcss/colors'),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "fade-in": "fade-in 0.6s ease-out forwards",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
          // 'spin-slow': 'spin 8s linear infinite',
          // 'fade-in': 'fade-in 0.6s ease-out forwards',
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      letterSpacing: {
        tighter: "-0.02em",
      },
    },
    plugins: [],
}

