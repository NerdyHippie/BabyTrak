component extends = "remote.nerdyHippieUtils" {
	this.sessionManagement = true;
	this.sessionTimeout = createTimeSpan(0,0,20,0);
	this.name = 'BabyTrak';
	
	function onApplicationStart() {
		
	}
	
	function onSessionStart() {
		if (!StructKeyExists(session,'isLoggedIn')) {
			session.isLoggedIn = false;
		}
	}
	
	function onRequestStart() {
		if (!StructKeyExists(session,'isLoggedIn') || !session.isLoggedIn) {
			if (cgi.script_name IS "/remote/authentication.cfc" AND ListFind('method=isLoggedIn,method=doLogin,method=doLogout',cgi.query_string)) {
                //WriteDump(cgi)
                // do nothing, allow it
            } else {
                setServerStatus(401,"Please log in");
            	abort;
            }
		}
	}
	
	function onError(exception,eventName) {
		WriteOutput(serializeJSON(exception));
		errorResponse(exception);
	}

}