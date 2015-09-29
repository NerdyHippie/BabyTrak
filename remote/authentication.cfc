component extends = "remote.nerdyHippieUtils" {
	
	remote function doLogin() returnformat="JSON" {
		arguments = applyHeaders(arguments);
		
		var errorData = {};
		var okToLogin = true;
		
		// Verify that both username and password are supplied
		if (!StructKeyExists(arguments,'username') || !Len(arguments.username)) {
			errorData['username'] = "Please provide a username.";
			okToLogin = false;
		}
		if (!StructKeyExists(arguments,'password') || !Len(arguments.password)) {
			errorData['password'] = "Please provide a password.";
			okToLogin = false;
		}
		
		
		if (okToLogin) {
			if (authenticateUser(arguments.username,arguments.password)) {
				// If the user authenticates successfully, get their information and load it into the session scope					
				session.userData = getUserInfo(username=arguments.username);
				session.userId = session.userData.id;
				
				// Throw the isLoggedIn flag last (in case anything else errors out first, default to disallow)
				session.isLoggedIn = true;

				return session.userData;
			} else {
				// Return a 401 Unauthorized
				errorData['errorMessage'] = "Invalid username/password.";
				setServerStatus(401,errorData.errorMessage);
				return errorData;
			}
			
		} else {
			// Return a 400 Bad Request
			setServerStatus(400,"Username and password are required");
			return errorData;
		}

	}
	
	remote function doLogout() returnformat="JSON" {
		StructClear(session);
		session.isLoggedIn = false;
	}
	
	remote function isLoggedIn() returnformat="JSON" {
		var ret = StructNew();
		ret['loggedIn'] = session.isLoggedIn;
		return ret;
	}  
	
	remote function getSessionData() returnformat="JSON" {
		return session;
	}
	
	remote function getUserInfo(userId,username) returnformat="JSON" {
		var data = {};
		
		if (StructKeyExists(arguments,'username') AND Len(arguments.username)) {
			data['uid'] 		= '2c9097d843b2e6250143b2eca90a0040';
			data['id']			= '2c9097d843b2e6250143b2eca90a0040';
			data['username'] 	= arguments.username;
			data['email'] 		= 'jorvis@nerdyhippie.com';
			data['firstName'] 	= 'Josh';
			data['lastName'] 	= 'Orvis';
			
		} else if (StructKeyExists(arguments,'userId') AND Len(arguments.userId)) {
			
			// Retrieve data for another user
			switch(arguments.userId) {
				case "2c9097d843b2e6250143b2ecb2c100d9":
					data['uid'] 		= "2c9097d843b2e6250143b2ecb2c100d9";
					data['id']			= "2c9097d843b2e6250143b2ecb2c100d9";
					data['username'] 	= 'maran';
					data['email'] 		= 'maran@nerdyhippie.com';
					data['firstName'] 	= 'Michelle';
					data['lastName'] 	= 'Aran';
					break;
				case "2c9097d843b2e6250143b2ecb30900e2":
					data['uid'] 		= "2c9097d843b2e6250143b2ecb30900e2";
					data['id']			= "2c9097d843b2e6250143b2ecb30900e2";
					data['username'] 	= 'jcasserly';
					data['email'] 		= 'jcasserly@nerdyhippie.com';
					data['firstName'] 	= 'Jeannette';
					data['lastName'] 	= 'Casserly';
					break;
				case "2c9097d84b50ecf7014b7598f783002b":
					data['uid'] 		= "2c9097d84b50ecf7014b7598f783002b";
					data['id']			= "2c9097d84b50ecf7014b7598f783002b";
					data['username'] 	= 'skuperberg';
					data['email'] 		= 'skuperberg@nerdyhippie.com';
					data['firstName'] 	= 'Steve';
					data['lastName'] 	= 'Kuperberg';
					break;
				default: 
					data['uid'] 		= arguments.userId;
					data['id']			= arguments.userId;
					data['username'] 	= 'jdoe';
					data['email'] 		= 'jdoe@nerdyhippie.com';
					data['firstName'] 	= 'John';
					data['lastName'] 	= 'Doe';
					break;
			}
			
			
		} else {
			
			// Retrieve data for current user
			
			data['uid'] 		= session.userId;
			data['id']			= '5555555555555555555555';
			data['username'] 	= 'jorvis';
			data['email'] 		= 'jorvis@nerdyhippie.com';
			data['firstName'] 	= 'Joshua';
			data['lastName'] 	= 'Orvis';
		}
		
		return data;
	}
	
	private function authenticateUser(username,password) {
		// Query Novell for user
		// Optional:  If user not found, query SQL DB as secondary data source
		
		return true;
	}
}