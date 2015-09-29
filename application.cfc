component extends = "remote.nerdyHippieUtils" {
	this.sessionManagement = true;
	this.sessionTimeout = createTimeSpan(0,0,20,0);
	this.name = 'BabyTrak';
	
	function onApplicationStart() {
		application.config = {
			firebaseSecret: 'LzffRtSRywSaL63Tx7A6inJZehbxZczpq0FdLzFI'
			,adminEmail: 'jorvis@nerdyhippie.com'
			,jwtIssuer: 'BabyTrak'
		};
	}
	
	function onSessionStart() {
		if (!StructKeyExists(session,'isLoggedIn')) {
			session.isLoggedIn = false;
		}
	}
	
	function onRequestStart() {
		if (StructKeyExists(url,'reinit') AND url.reinit IS true) {
			StructClear(session);
			StructClear(application);
			onApplicationStart();
			onSessionStart();
			
			var returnUrl = cgi.script_name;
			var qs = ListDeleteAt(cgi.query_string,ListFindNoCase(cgi.query_string,'reinit=true','&'),'&');
			if (Len(qs)) {
				returnUrl &= "?" & qs;
			}
			
			location(url=returnUrl,addToken=false);
			
		}
		
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