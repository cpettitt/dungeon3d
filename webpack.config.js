"use strict";

var path = require("path");
var webpack = require("webpack");

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
        test: /\.png$|\.jpg$/,
        loader: "file?name=[path][name].[ext]"
      },
      {
        test: /\.json$/,
        loader: "json"
      }
    ]
  },
  resolve: {
    root: [path.join(__dirname, "bower_components")]
  },
  plugins: [
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"]))
  ]
};
