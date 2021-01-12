//引入required模块
var http = require("http");
//创建服务器
http.createServer(function(request,response){
	//发送头部
	response.writeHead(200,{'Content-Type':'text/plain'});
	//发送响应数据
	response.end('hello , world\n');
}).listen(8888);

//终端打印以下信息
console.log('Serve running at http://127.0.01:8888/');