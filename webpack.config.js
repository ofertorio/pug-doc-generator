const nodeExternals = require("webpack-node-externals");

/**
 * @type {import("webpack").Configuration}
 */
module.exports = {
    mode: process.env.NODE_ENV !== "production" ? "development" : "production",
    entry: __dirname + "/src/index.ts",
    target: "node",
    devtool: "inline-source-map",
    output: {
        filename: "index.js",
        path: __dirname + "/dest/",
        library: {
            name: "pugDocGenerator",
            type: "umd"
        }
    },
    resolve: {
        extensions: [".js", ".ts", ".pug"]
    },
    externalsPresets: {
        node: true
    },
    externals: nodeExternals({
        allowlist: ["pug-code-block"]
    }),
    module: {
        rules: [
            {
                test: /\.pug$/,
                exclude: /node_modules/,
                use: "pug-loader"
            },
            {
                test: /\.ts/,
                exclude: /node_modules/,
                use: "ts-loader"
            }
        ]
    }
};