const path = require('path');
module.exports = {
    entry: './public/demo/TestDemo.ts',
    output: {
        path: path.resolve(__dirname, "build"),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            { test: /\.ts$/, exclude: /node_modules/, use: ['ts-loader'] }
        ]
    },
    //配置模块化引入文件的缺省类型
    resolve: {
        extensions:['.js','.ts']
    },
};