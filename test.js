const http=require("http");
http.createServer(function(req, res){
    res.writeHead(200,{"Content-type":"text/html"});
    res.end("hello world");
}).listen(8090);