component extends = "remote.nerdyHippieUtils" {
	
	remote function doLogin() returnformat="JSON" {
		arguments = applyHeaders(arguments);
		
		var errorData = {};
		var doLogin = true;
		
		if (!StructKeyExists(arguments,'username') || !Len(arguments.username)) {
			errorData['username'] = "Please provide a username.";
			doLogin = false;
		}
		if (!StructKeyExists(arguments,'password') || !Len(arguments.password)) {
			errorData['password'] = "Please provide a password.";
			doLogin = false;
		}
		
		if (doLogin) {
			loginSuccess = true;
			
			if (loginSuccess) {
				session.isLoggedIn = true;
	
				var data = {};
		        data['id'] = arguments.username;
		        data['firstName'] = 'Josh';
		        data['lastName'] = 'Orvis';
		        
				session.userData = data;
				
				return session.userData;
			} else {
				// 401 Unauthorized
				errorData['errorMessage'] = "Invalid username/password.";
				setServerStatus(401,errorData.errorMessage);
				return errorData;
			}
			
		} else {
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
	
	remote function getUserInfo(userId) returnformat="JSON" {
		if (session.isLoggedIn) {
			if (StructKeyExists(arguments,'userId') AND Len(arguments.userId)) {
				var data = {};
				data['id'] = arguments.userId;
				data['firstName'] = 'John';
				data['lastName'] = 'Doe';
				
			} else {
				var data = session.userData;
			}
			
			return data;
		}
	}
}