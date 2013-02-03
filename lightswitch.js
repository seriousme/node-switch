var SWITCHCMD='/usr/local/bin/lightswitch';

var switchMap={
	'device1':{ 'group':'B','device':1},
	'device2':{ 'group':'B','device':2},
	'device3':{ 'group':'B','device':3},
	'device4':{ 'group':'C','device':1},
	'device5':{ 'group':'C','device':2},
	'power':{ 'group':'C','device':2}
};

exports.switch=function(key,value){
	if (! switchMap[key]) return;
	var dev=switchMap[key];
	console.log(SWITCHCMD,'-g',dev.group,'-n',dev.device,value);
	var spawn = require('child_process').spawn;
    var lightSwitch = spawn(SWITCHCMD, ['-g',dev.group,'-n',dev.device,value]);

	lightSwitch.on('exit', function (code) {
		if (code !== 0) {
			console.log(SWITCHCMD,'exited with code',code);
		}
	});
};

