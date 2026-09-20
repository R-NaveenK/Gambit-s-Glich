/** Compile the utility classes already used throughout the supplied app. */
export default {
  content: ['./index.html', './src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F2F0E9', paper: '#E8E3D8', ink: '#10100E',
        signal: '#D79218', 'signal-light': '#E7B94F', 'signal-white': '#F7F7F7',
        accent: '#D8971F', 'accent-light': '#DCBC58', 'accent-dark': '#735110',
        muted: '#77756F', line: 'rgba(16,16,14,0.18)',
        inverse: '#10100E', 'inverse-text': '#F2F0E9',
        error: '#9C2F25', success: '#465A32', carbon: '#10100E',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Arial', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['Spline Sans Mono', 'monospace'],
      },
      opacity: { 15: '0.15' },
      transitionDuration: { 800: '800ms' },
    },
  },
  plugins: [],
};
