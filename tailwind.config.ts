export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5272fe',    // màu chính
          light: '#3b82f6',      // nhẹ hơn
          dark: '#1e3a8a',       // đậm hơn
        }
      },
      animation: {
        bounce: "bounce 1.5s infinite",
      },
      keyframes: {
        bounce: {
          "0%, 100%": {
            transform: "translateY(-10%)", 
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      },
    }
  },
  plugins: [],
}
