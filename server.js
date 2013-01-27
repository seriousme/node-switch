
var ls=require('./lightswitch');

var state={
    "auto":"on",
    "device1":"off",
    "device2":"off",
    "device3":"off",
    "device4":"off",
    "device5":"off",
	"power":{}
};

var statevals={"on":"1","off":"0"};

function handlePower(q,c){
	if (! q) return;
	if (! q.cmd) return;
	c="ip" + c;
	if (q.cmd == "on"){
		if (Object.keys(state.power).length === 0)
			ls.switch('power',q.cmd);
		state.power[c]="active";
	}
	if (q.cmd == "off"){
		delete(state.power[c]);
		if (Object.keys(state.power).length === 0)
			ls.switch('power',q.cmd);
	}
	if (q.cmd == "del"){
		state.power={};
		ls.switch('power','off');
	}
}

function handleState(q){
	if (! q) return;
	Object.keys(q).forEach(function(key) {
        var val = q[key];
		if (! statevals[val]) return;
        if (state[key] !== val){
			ls.switch(key,val);
			state[key] = val;
		}
	});

}

var connect = require('connect')
  , http = require('http');


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

// required for c9.io compatibility
var host = "localhost";
var port = 80;
    
if (process.env.C9_PID)
{
    host=process.env.IP;
    port=process.env.PORT;
}
else
    console.log("Server is running at","http://"+host+":"+port);


http.createServer(app).listen(port,host);





