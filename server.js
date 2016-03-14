var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

function send404(responce){
	responce.writeHead(404, {'Content-Type': 'text/plain'});
	responce.write('Error 404: resource not found');
	responce.end();
}

function sendFile(responce, filePath, fileContents){
	responce.writeHead(
		200,
		{'Content-Type': mime.lookup(path.basename(filePath))}
	);
	responce.end(fileContents);
}

function serveStatic(responce, cache, absPath){
	if(cache[absPath]){
		sendFile(responce, absPath, cache[absPath]);
	}else{
		fs.exists(absPath, function(exists){
			if (exists){
				fs.readFile(absPath, function(err, data){
					if(err){
						send404(responce);
					}else{
						cache[absPath] = data;
						sendFile(responce, absPath, data);
					}
				});
			}else{
				send404(responce);
			}
		});
	}
}

var server = http.createServer(function(request, responce){
	var filePath = false;
	if (request.url == '/'){
		filePath = 'public/index.html';
	}else{
		filePath = 'public' + request.url;
	}

	var absPath = './' + filePath;
	serveStatic(responce, cache, absPath);
})

server.listen(3000, function(){
	console.log("Running");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);