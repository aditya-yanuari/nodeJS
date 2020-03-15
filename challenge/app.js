var http = require('http');
var url  = require('url');
var qString = require('querystring');
var router = require('routes')();
var view   = require('swig');
var mysql  = require('mysql');
var conn   = mysql.createConnection({
	host : "localhost",
	port : 3306,
	database :"challenge", 
	user : "root",
	password :""
});

router.addRoute('/',function(req, res){
	conn.query("select * from product", function(err,rows,field){
		if (err) throw err;
		var html = view.compileFile('./template/index.html')({
		title : "Data Product",
		data : rows
	});

	res.writeHead(200,{"Content-Type" : "text/html"});
	res.end(html);
	
	});
	
});



router.addRoute('/insert', function(req, res){

	if (req.method.toUpperCase() == "POST"){
		var data_post = "";

		req.on('data',function(chuncks){
			data_post += chuncks;
		});

		req.on('end', function(){
			data_post = qString.parse(data_post);
			conn.query("insert into product set ?",data_post,
				function(err,field){

			if (err) throw err;
				res.writeHead(302, {"Location" : "/"});
				res.end();
			});
		});
	}else {
		var html = view.compileFile('./template/tambah_data.html')();
	res.writeHead(200, {"Content-Type" : "text/html"});
	res.end(html);

	}
	
});



router.addRoute('/update/:id', function(req, res){

conn.query("select * from product where ?",
	{ id : this.params.id },
	function(err,rows,field){
	if(rows.length){
		var data = rows[0];
			if (req.method.toUpperCase() == "POST"){
				var data_post ="";
				req.on('data',function(chuncks){
					data_post += chuncks;
				});

				req.on('end',function(){
					data_post = qString.parse(data_post);
					conn.query("update product set ? where?",[
						data_post,
						{ id : data.id}
						],function(err,field){
							if(err)throw err

							res.writeHead(302, {"Location" : "/"});
							res.end();
						});
				});

			} else {
			var html = view.compileFile('./template/update.html')({
				data : data
			});
			res.writeHead(200,{"Content-Type" : "text/html"});
			res.end(html);
			}
			}else{
			var html = view.compileFile('./template/404.html')();
			res.writeHead(404, {"Content-Type" : "text/html"});
			res.end(html);
	}
});
});


router.addRoute('/delete/:id', function(req, res){

	conn.query("delete from product where ?",
		{id : this.params.id},
		function(err,field){
			if(err) throw err;

			res.writeHead(302, {"Location" : "/"});
	res.end();
		});
});




http.createServer(function (req,res){
	var path = url.parse(req.url).pathname;
	var match = router.match(path);
	if (match){
		match.fn(req,res);
	} else {
		var html = view.compileFile('./template/404.html')();
		res.writeHead(404, {"Content-Type" : "text/html"});
		res.end(html);
	}
}).listen(8080);

console.log('server berjalan.');