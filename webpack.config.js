"use strict";

var path = require("path");

module.exports = {
  context: path.join(__dirname, "/app"),
  entry: {
    javascript: "./js",
    html: "./index.html"
  },
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "js/bundle.js"
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"]
      },
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]"
      },
      {
        test: /\.css$/,
        loaders: ["style-loader", "css-loader"]
      },
      {
        test: /\.png$/,
        loader: "file?name=[path][name].[ext]"
      },
      {
        test: /\.json$/,
        loader: "json"
      }
    ]
  }
};
