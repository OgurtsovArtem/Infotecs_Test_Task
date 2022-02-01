const path = require("path");

module.exports = {
  entry: "./src/js/script.js",
  output: {
    path: path.resolve(__dirname, "js"),
    filename: "[name].bundle.js",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  mode: "production",
};
