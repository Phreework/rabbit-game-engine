"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//引入required模块
var http = require("http");
var fs = require("fs");
//创建服务器
http.createServer(function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        fs.readFile('./demo/text.html', function (err, data) {
            // body
            if (err) {
                console.log(err);
                //404：NOT FOUND
                response.writeHead(404, { "Content-Type": "text/html" });
            }
            else {
                //200：OK
                response.writeHead(200, { "Content-Type": "text/html" });
                response.write(data.toString());
            }
            response.end();
        });
        // await detail(response);
        // 发送头部
        // response.writeHead(200, { 'Content-Type': 'text/plain' });
        // //发送响应数据
        // response.end('hello , world\n');
    });
}).listen(8888);
//终端打印以下信息
console.log('Serve running at http://127.0.01:8888/');
function detail(response, query_param) {
    return __awaiter(this, void 0, void 0, function* () {
        fs.readFile('./demo/text.html', 'utf-8', function (err, data) {
            return new Promise((success, fail) => {
                if (err)
                    throw err;
                response.setHeader('content-type', 'text/html;charset=utf-8');
                response.writeHead(200, { "Content-Type": "text/plain" });
                // response.write(data);
                response.end(data);
                success(true);
            });
        });
    });
}
