component extends="remote.nerdyHippieUtils" {
	this.lib = createObject( "component", "cfmlsJWT" ).init(
				iss = application.config.jwtIssuer
				,aud = "Firebase"
				,exp = 43200
		    );
		    
	remote any function getToken() returnformat="JSON" {
		
		if (StructKeyExists(session,'userId')) {
			
			try {
				var usr = DeserializeJSON(SerializeJSON(session.userData));
				StructDelete(usr,'password');
				
				//WriteDump(usr);
				usr['uid'] = usr.id;
				
				local.jwt = this.lib.encode(usr,application.config.firebaseSecret);
				
				var ret = StructNew();
				ret['token'] = local.jwt;
				
				return ret;
			} catch(any e) {
				errorResponse(e);
			}
		}
	}
	
	remote any function decodeToken(token) returnformat="JSON" {
		try {
			return this.lib.decode(jwt=arguments.token,key=application.config.firebaseSecret,verify=true);	
		} catch (any e) {
			errorResponse(e);
		}
	    
	   
	}
}