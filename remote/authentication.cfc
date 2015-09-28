component extends = "remote.nerdyHippieUtils" {
	
	this.loggedIn = false;
	this.userData = {};
	
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
				this.loggedIn = true;
	
				var data = {};
		        data.id = arguments.username;
		        data.firstName = 'Johnny';
		        data.lastName = 'Doe';
		        
				this.userData = data;
				
				return this.userData;
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
		this.loggedIn = false;
		this.userData = {};
		
		session.isLoggedIn = false;
	}
	
	remote function getUserInfo(userId) returnformat="JSON" {
		if (this.loggedIn) {
			if (StructKeyExists(arguments,'userId') AND Len(arguments.userId)) {
				var data = {};
				data['id'] = arguments.userId;
				data['firstName'] = 'John';
				data['lastName'] = 'Doe';
				
			} else {
				var data = this.userData;
			}
			
			return data;
		}
	}
}