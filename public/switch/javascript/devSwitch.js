var devSwitch = {
   update : function(serviceResponse, isInit) {
      var dev, status, el; 
      for(dev in serviceResponse) {
         status = (serviceResponse[dev] == 'on') ? true : false; 
         el = document.getElementById(dev); 
	   if (el) {
            if (isInit) {
               el.parentNode.addEventListener("mouseup", devSwitch.check, false); 
            }
            if (el.type === "checkbox") {
               if (el.checked != status) {
                  el.checked = status; 
                  //el.onchange()
			 }
               }
            }
         }
      }
   , callService : function(label, id, value, isInit) {
      var serviceUrl = '/cgi-bin/switch?sid=' + Math.random(); 
      if (label=='device' && (id  && value )) 
         serviceUrl=serviceUrl.concat('&device=' + id + '&value=' + value); 
      if (label=='config' && (id  && value )) 
         serviceUrl=serviceUrl.concat('&config=' + id + '&value=' + value); 
         
      var xhr = new XMLHttpRequest(); 
      xhr.open("GET", serviceUrl , true); 
      xhr.onreadystatechange = function() { 
         if ( xhr.readyState == 4 ) {
            if ( xhr.status == 200 ) {
               //alert(xhr.responseText);
	         //serviceResponse = JSON.parse(xhr.responseText); 
		   var serviceResponse = eval('(' + xhr.responseText + ')');
		   devSwitch.update(serviceResponse, isInit); 
               }
            else {
               alert('error'); 
               }
            }
         }; 
      xhr.send(null); 
      }
   , check : function() {
	var el = this.lastChild;
	//  Fix for IE
	if (! el) 
		el = window.event.srcElement.lastChild;
	if (el.id.match(/^device/)){
     		var value = (el.checked) ? 'off':'on'; 
		var device = el.id.replace(/device/,"");
     		devSwitch.callService('device', device, value, false); 
     	}
	if (el.id=='auto'){
     		var value = (el.checked) ? 'off':'on'; 
     		devSwitch.callService('config', el.id, value, false); 
     	}
      }
   , initButtons: function(){
      var el;
      el=document.getElementById("blinds1Up");
      if (el)
 	     el.addEventListener("click",function(){ devSwitch.callService("device","6","off",false);},false);
      el=document.getElementById("blinds1Down");
      if (el)
      	el.addEventListener("click",function(){ devSwitch.callService("device","6","on",false);},false);
      el=document.getElementById("blinds2Up");
      if (el)
 	     el.addEventListener("click",function(){ devSwitch.callService("device","7","off",false);},false);
      el=document.getElementById("blinds2Down");
      if (el)
      	el.addEventListener("click",function(){ devSwitch.callService("device","7","on",false);},false);
   	}
   , init : function() {
      	devSwitch.callService(false,false,false,true); 
      	devSwitch.initButtons();
      }
};
window.addEventListener("load", devSwitch.init, false); 

