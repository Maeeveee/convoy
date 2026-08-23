const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-px-to-viewport-8-plugin": {
      unitToConvert: "px",
      viewportWidth: 1920,
      unitPrecision: 5,
      propList: ["*", "!border*"],
      viewportUnit: "vw",
      fontViewportUnit: "vw",
      selectorBlackList: ["ignore-vw"],
      minPixelValue: 1,
      mediaQuery: true,
      replace: true,
      landscape: false,
    },
  },
}

export default config
