var switchCmd='/usr/local/bin/lightswitch';

var switchmap={
	"device1":{ "group":"B","device":1},
	"device2":{ "group":"B","device":2},
	"device3":{ "group":"B","device":3},
	"device4":{ "group":"C","device":1},
	"device5":{ "group":"C","device":2},
	"power":{ "group":"C","device":2}
}

exports.switch=function(k,v){
	if (! switchmap[k]) return;
	var dev=switchmap[k];
	console.log(switchCmd,"-g",dev.group,"-n",dev.device,v);
	var spawn = require('child_process').spawn,
     lightswitch = spawn(switchCmd, ['-g',dev.group,'-n',dev.device,v]);

	lightswitch.on('exit', function (code) {
		if (code !== 0) {
			console.log('lightswitch process exited with code ' + code);
		}
	});
}

