module.exports = { 
  content: ["./node_modules/flyonui/dist/js/*.js"], // Require only if you want to use FlyonUI JS component

  plugins: [
    require("flyonui"),
    require("flyonui/plugin") // Require only if you want to use FlyonUI JS component
  ]
}

