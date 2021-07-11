const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
    entry: './src/demo/TestDemo.ts',
    output: {
        path: path.resolve(__dirname, "build"),
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.ts$/,
            exclude: /node_modules/,
            use: ['ts-loader']
        }]
    },
    //配置模块化引入文件的缺省类型
    resolve: {
        extensions: ['.js', '.ts']
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
            }),
        ],
        terserOptions: {
            keep_classnames: true
        }
    },
};