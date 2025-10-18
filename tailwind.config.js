/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  safelist: [
    // Type badges
    'bg-type-mixte',
    'text-type-mixte-foreground',
    'hover:bg-type-mixte-hover',
    'bg-type-mixte-foreground',
    'bg-type-comparee',
    'text-type-comparee-foreground',
    'hover:bg-type-comparee-hover',
    'bg-type-comparee-foreground',
    // Highlight colors
    'border-highlight',
    'bg-highlight-bg',
    // Status colors
    'text-success',
    'text-info',
    'text-destructive',
    'bg-success-light',
    'border-success-border',
    'bg-info-light',
    'border-info-border',
    'bg-accent',
    'border-accent',
    'text-accent-foreground',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          light: 'hsl(var(--success-light))',
          border: 'hsl(var(--success-border))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          light: 'hsl(var(--info-light))',
          border: 'hsl(var(--info-border))',
        },
        highlight: {
          DEFAULT: 'hsl(var(--highlight))',
          bg: 'hsl(var(--highlight-bg))',
        },
        'type-mixte': {
          DEFAULT: 'hsl(var(--type-mixte))',
          foreground: 'hsl(var(--type-mixte-foreground))',
          hover: 'hsl(var(--type-mixte-hover))',
        },
        'type-comparee': {
          DEFAULT: 'hsl(var(--type-comparee))',
          foreground: 'hsl(var(--type-comparee-foreground))',
          hover: 'hsl(var(--type-comparee-hover))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
