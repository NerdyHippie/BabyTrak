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
		if (!session.isLoggedIn) {
			if (cgi.script_name IS "/remote/authentication.cfc") {
                //WriteOutput('go ahead and log in please');
                // do nothing, allow it
            } else {
                setServerStatus(401,"Please log in");
            	abort;
            }
		} else {
			WriteOutput('congrats, you are logged in!');
		}
	}
	
	function onError(exception,eventName) {
		WriteOutput(serializeJSON(exception));
		errorResponse(exception);
	}

}