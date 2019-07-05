const http = require('http');
const {parse} = require('querystring');
const mysql = require('mysql');
const con = mysql.createConnection({
	host: 'localhost',
	user: 'tracker',
	password: 'trackerpass',
	database: 'trackerdb'
});

const { PythonShell } = require('python-shell');
function connect(){
	con.connect((err) => {
		if(err){
			console.log('Error connecting to Db');
			return;
		}
		console.log('Connection established');
	});
}
function close(){ //to close the connection
	con.end((err) => {
		console.log("Connection Closed Successfully")
	});
}

function sent_requests(req, res, reqUrl) {
	req.setEncoding('utf8');
	let body='';
	console.log("Retriving Requests")
	req.on('data', chunk => {
		body+=chunk.toString();
	});
	req.on('end',()=>{
		console.log(parse(body))
		uname=parse(body)['username']
		con.query("select second from share where first = '"+uname+"'and perm=0;", (err,rows) => {
			if(err){console.log(err);res.end({"error":"DB connection error"});console.log('DB connection error');}
			rows=JSON.parse(JSON.stringify(rows))
			res.end(JSON.stringify(rows));
		});
	});	
}

function ret_users(req, res, reqUrl) {
	req.setEncoding('utf8');
	let body='';
	console.log("Listing all users")
	req.on('data', chunk => {
		body+=chunk.toString();
	});
	req.on('end',()=>{
		console.log(parse(body))
		uname=parse(body)['username']
		con.query("select username from login where username!='"+uname+"';", (err,rows) => {
			if(err){console.log(err);res.end({"error":"DB connection error"});console.log('DB connection error');}
			rows=JSON.parse(JSON.stringify(rows))
			res.end(JSON.stringify(rows));
		});
	});	
}

function ret_shares(req, res, reqUrl) {
	req.setEncoding('utf8');
	let body='';
	console.log("Retriving all users shared to me")
	req.on('data', chunk => {
		body+=chunk.toString();
	});
	req.on('end',()=>{
		console.log(parse(body))
		uname=parse(body)['username']
		con.query("select second from share where first = '"+uname+"'and perm=1;", (err,rows) => {
			if(err){console.log(err);res.end({"error":"DB connection error"});console.log('DB connection error');}
			rows=JSON.parse(JSON.stringify(rows))
			res.end(JSON.stringify(rows));
		});
	});	
}


function accept_request(req, res, reqUrl) {
	req.setEncoding('utf8');
	let body='';
	console.log("Accepting a request")
	req.on('data', chunk => {
		body+=chunk.toString();
	});
	req.on('end',()=>{
		console.log(parse(body))
		from_name=parse(body)['from_name']
		to_name=parse(body)['to_name']
		//update share set perm=1 where first='frm_name' and second='to_name';
		con.query("update share set perm=1 where first='"+from_name+"' and second='"+to_name+"';", (err,rows) => {
				if(err) console.log(err);
				console.log("Inserted request from "+from_name+" to "+to_name+" "+" Successfully");
				res.end('{"success":"Accept logged Successfully","from":"'+from_name+'","to":"'+to_name+'"}');
			});
	});	
}


function send_request(req, res, reqUrl) {
	req.setEncoding('utf8');
	let body='';
	console.log("Received a friend request")
	req.on('data', chunk => {
		body+=chunk.toString();
	});
	req.on('end',()=>{
		console.log(parse(body))
		from_name=parse(body)['from_name']
		to_name=parse(body)['to_name']
		con.query("insert into share (first,second,perm) VALUES('"+from_name+"','"+to_name+"',0);", (err,rows) => {
				if(err) console.log(err);
				console.log("Inserted request from "+from_name+" to "+to_name+" "+" Successfully");
				res.end('{"success":"Request logged Successfully","from":"'+from_name+'","to":"'+to_name+'"}');
			});
	});	
}



function ret_requests(req, res, reqUrl) {
	req.setEncoding('utf8');
	let body='';
	console.log("Retriving Requests")
	req.on('data', chunk => {
		body+=chunk.toString();
	});
	req.on('end',()=>{
		console.log(parse(body))
		uname=parse(body)['username']
		con.query("select first from share where second = '"+uname+"'and perm=0;", (err,rows) => {
			if(err){console.log(err);res.end({"error":"DB connection error"});console.log('DB connection error');}
			rows=JSON.parse(JSON.stringify(rows))
			res.end(JSON.stringify(rows));
		});
	});	
}




function listnotes(req, res, reqUrl) {
	req.setEncoding('utf8');
	let body='';
	console.log("Listing Notes")
	req.on('data', chunk => {
		body+=chunk.toString();
	});
	req.on('end',()=>{
		console.log(parse(body))
		uname=parse(body)['username']
		con.query("select note,score from notes where username = '"+uname+"';", (err,rows) => {
			if(err){console.log(err);res.end({"error":"DB connection error"});console.log('DB connection error');}
			rows=JSON.parse(JSON.stringify(rows))
			res.end(JSON.stringify(rows));
		});
	});	
}

function postnote(req, res, reqUrl) {
	req.setEncoding('utf8');
	let body='';
	console.log("Received a Note")
	req.on('data', chunk => {
		body+=chunk.toString();
	});
	req.on('end',()=>{
		console.log(parse(body))
		uname=parse(body)['username']
		note=parse(body)['note']
		PythonShell.run('sent.py', {mode: 'text',pythonPath: 'python',args: note}, function (err, results) {
			if (err){console.log(err);}
			console.log(results[0]);
			con.query("insert into notes (username,note,score) VALUES('"+uname+"','"+note+"',"+results[0]+");", (err,rows) => {
				if(err) console.log(err);
				console.log("Inserted "+uname+" "+note+" "+results[0]+" Successfully");
				res.end('{"success":"Note Inserted Successfully","note":"'+note+'","score":"'+results[0]+'"}');
			});
		});
	});	
}

function register(req, res, reqUrl) {
	req.setEncoding('utf8');
	let body='';
	//	console.log("Received Post")
	req.on('data', chunk => {
		body+=chunk.toString();
	});
	req.on('end',()=>{
		//  	console.log("Request Ended");
		console.log(parse(body))
		uname=parse(body)['username']
		pass=parse(body)['password']
		conf=parse(body)['confirm'];
		email=parse(body)['email'];
		var found=false;
		if(pass!=conf){res.end('{"error":"Password and Confirm Password don\'match"}');}
		con.query("select * from login;", (err,rows) => {
			console.log('Data received from Db:\n');
			rows=JSON.parse(JSON.stringify(rows))
			for(var i=0;i<rows.length;i++){
				if(rows[i]['username']==uname){found=true;
					res.end('{"error":"Username Taken"}',()=>{console.log("Username Taken")})
					break;}
			}
			if(!found){
				console.log('When not found create one and then end');
				con.query("insert into login (username,password,mail) VALUES('"+uname+"','"+pass+"','"+email+"');", (err,rows) => {
					if(err) throw err;
					console.log('Inserted Successfully to the DB\n');
					res.end('{"success":"Account created","username":"'+uname+'"}',()=>{console.log("Account Created")});
				});
			}
			//			console.log(rows);
		});
	});	
}




function login(req, res, reqUrl) {
	req.setEncoding('utf8');
	let body='';
	console.log("Received Post")
	req.on('data', chunk => {
		body+=chunk.toString();
	});
	req.on('end',()=>{
		console.log("Request Ended");
		console.log(parse(body))
		uname=parse(body)['username']
		pass=parse(body)['password']
		con.query("select * from login;", (err,rows) => {
			console.log('Data received from Db:\n');
			rows=JSON.parse(JSON.stringify(rows))
			for(var i=0;i<rows.length;i++){
				if(rows[i]['username']==uname){
					if(rows[i]['password']==pass){res.end('{"login":"success","username":"'+uname+'"}');
						console.log("Login Success")}
					else{res.end('{"error":"Password Incorrect"}');console.log("Password Incorrect");}
					break;}
			}
			res.end('{"error":"Username Not found"}',()=>{console.log("Username Not Found")});
			//			console.log(rows);
		});
	});	
}





function noResponse(req, res) {
	res.writeHead(404);
	res.write('{"error":"No response at this URL"}\n');
	res.end();
}


http.createServer((req, res) => {
	const router = {
		'POST/login': login,
		'POST/register': register,
		'POST/note': postnote,
		'POST/list':listnotes,
		'POST/ret_requests':ret_requests,
		'POST/send_request':send_request,
		'POST/accept_request':accept_request,
		'POST/ret_shares':ret_shares,
		'POST/ret_users':ret_users,
		'POST/sent_requests':sent_requests,
		'default': noResponse 
	};
	let reqUrl = new URL(req.url, 'http://127.0.0.1/');
	// find the related function by searching "method + pathname" and run it
	let redirectedFunc = router[req.method + reqUrl.pathname] || router['default'];
	redirectedFunc(req, res, reqUrl);
}).listen(8080, () => {
	console.log('Server is running at http://127.0.0.1:8080/');
});

