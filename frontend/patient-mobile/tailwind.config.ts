import type { Config } from 'tailwindcss';
import designSystemPreset from '@health/design-system/tailwind.preset';

const config: Config = {
  presets: [designSystemPreset as Config],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/design-system/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
