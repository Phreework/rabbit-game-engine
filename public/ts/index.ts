//引入required模块
var http = require("http");
var fs = require("fs");
//创建服务器
http.createServer(async function (request, response) {
    fs.readFile('./demo/text.html',function(err,data){
        // body
        if(err){
            console.log(err);
            //404：NOT FOUND
            response.writeHead(404,{"Content-Type":"text/html"});
        }
        else{
            //200：OK
            response.writeHead(200,{"Content-Type":"text/html"});
            response.write(data.toString());
        }
        response.end();
    });
    // await detail(response);
    // 发送头部
    // response.writeHead(200, { 'Content-Type': 'text/plain' });
    // //发送响应数据
    // response.end('hello , world\n');
}).listen(8888);

//终端打印以下信息
console.log('Serve running at http://127.0.01:8888/');

async function detail(response, query_param?) {
    fs.readFile('./demo/text.html', 'utf-8', function (err, data) {//读取内容
        return new Promise((success,fail)=>{
            if (err) throw err;
            response.setHeader('content-type', 'text/html;charset=utf-8');
            response.writeHead(200, { "Content-Type": "text/plain" });
            // response.write(data);
            response.end(data);
            success(true);
        })
    });
}