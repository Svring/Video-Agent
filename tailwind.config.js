/** @type {import('tailwindcss').Config} */
import withMT from '@material-tailwind/react/utils/withMT';
const {nextui} = require("@nextui-org/react");

export default withMT({
  content: [
    './src/index.html', './src/**/*.{js,ts,jsx,tsx}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'slate-800': 'rgb(30 41 59)',
        'slate-900': 'rgb(15 23 42)'
      }
    }
  },
  variants: {
    extend: {},
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui']
    }
  },
  plugins: [nextui()]
});
