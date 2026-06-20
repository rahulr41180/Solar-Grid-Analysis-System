import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        panel: '#0f172a',
        'panel-light': '#1e293b',
        accent: '#38bdf8',
      },
    },
  },
  plugins: [],
};

export default config;
