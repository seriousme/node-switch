function createIEaddEventListeners()
{
    if (document.addEventListener || !document.attachEvent)
        return;

    function ieAddEventListener(eventName, handler, capture)
    {
        if (this.attachEvent)
            this.attachEvent('on' + eventName, handler);
    }

    function attachToAll()
    {
        var i, l = document.all.length;

        for (i = 0; i < l; i++)
            if (document.all[i].attachEvent)
                document.all[i].addEventListener = ieAddEventListener;
    }

    var originalCreateElement = document.createElement;

    document.createElement = function(tagName)
    {
        var element = originalCreateElement(tagName);
        
        if (element.attachEvent){
            element.addEventListener = ieAddEventListener;
		}

        return element;
    }
 
    window.addEventListener = ieAddEventListener;
    document.addEventListener = ieAddEventListener;

    var body = document.body;
    
    if (body)
    {
        if (body.onload)
        {
            var originalBodyOnload = body.onload;

            body.onload = function()
            {
                attachToAll();
                originalBodyOnload();
            };
        }
        else
            body.onload = attachToAll;
    }
    else
        window.addEventListener('load', attachToAll);
}

createIEaddEventListeners();