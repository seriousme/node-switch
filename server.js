
var ls=require('./lightswitch');

var state={
    'auto':'on',
    'device1':'off',
    'device2':'off',
    'device3':'off',
    'device4':'off',
    'device5':'off',
	'power':{}
};

var statevals={'on':'1','off':'0'};

function handlePower(query,client){
	if (! query) return;
	if (! query.cmd) return;
	client='ip' + client;
	if (query.cmd === 'on'){
		if (Object.keys(state.power).length === 0)
			ls.switch('power',query.cmd);
		state.power[client]='active';
	}
	if (query.cmd === 'off'){
		delete(state.power[client]);
		if (Object.keys(state.power).length === 0)
			ls.switch('power',query.cmd);
	}
	if (query.cmd === 'del'){
		state.power={};
		ls.switch('power','off');
	}
}

function handleState(query){
	if (! query) return;
	Object.keys(query).forEach(function(key) {
        var val = query[key];
		if (! statevals[val]) return;
        if (state[key] !== val){
			ls.switch(key,val);
			state[key] = val;
		}
	});

}

var connect = require('connect');
var http = require('http');


var app = connect()
  .use(connect.logger('dev'))
  .use(connect.static('public'))
  .use(connect.query())
  .use('/cgi-bin/switch',function(req, res){
    handleState(req.query);
    res.end(JSON.stringify(state));
   })
   .use('/cgi-bin/power',function(req, res){
    handlePower(req.query,req.connection.remoteAddress);
    res.end(JSON.stringify(state));
   })
  .use(function(req, res){
    res.writeHead(404, {'content-type':'text/plain'});
    res.end('404: Page not found\n');
  });


var host = 'localhost';
var port = 80;

// required for c9.io testing compatibility
if (process.env.C9_PID)
{
    host=process.env.IP;
    port=process.env.PORT;
}
else
    console.log('Server is running at','http://'+host+':'+port);

http.createServer(app).listen(port,host);





