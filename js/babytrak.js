var ref = new Firebase("https://babytrak.firebaseio.com");
var usersRef = new Firebase('https://babytrak.firebaseio.com/users');
var babyRef = new Firebase('https://babytrak.firebaseio.com/babies');

var bt = angular.module("babyTrak", ['firebase','nhUtils','ngRoute','ngResource','ngStorage'])
	.config(['$routeProvider',function($routeProvider) {
		$routeProvider
			.when('/',{
				templateUrl: 'partials/home.html'
				,selectedHeader: 'home'
				//,controller: 'loginPageController'
			})
			.when('/feedings',{
				templateUrl: 'partials/feedings.html'
				,selectedHeader: 'feedings'
				,controller: 'feedingListController'
			})
			.when('/users',{
				templateUrl: 'partials/users.html'
				,selectedHeader: 'users'
				,controller: 'userListController'
			})
			.when('/babies',{
				templateUrl: 'partials/babies.html'
				,selectedHeader: 'babies'
				,controller: 'babyListController'
			})
			.otherwise({ redirectTo: '/' })
	}])
	.run(['$rootScope','$localStorage','CFauth',function($rootScope,$localStorage,CFauth) {
		$rootScope.isLoggedIn = false;

		if ($localStorage.loggedInUserId) {
			CFauth.isLoggedIn(function(loggedIn) {
				console.log('CF auth says logged in = %o',loggedIn);
				if (loggedIn) {

					CFauth.getUserInfo($localStorage.loggedInUserId,function(data) {
						$localStorage.loggedInUserData = data;
						//$rootScope.currentUser = data;
						$rootScope.isLoggedIntoCF = true;
					});

					console.log('Welcome back!', $localStorage.authToken);
				} else {
					console.log('you have already logged in, but you need an auth token!');
				}
			});
		}
	}]);

bt.service('jwtService',['$q','$resource',function($q,$resource) {
	var jwtResource = $resource(
		'/remote/JWTwrapper.cfc'
		,{}
		,{
			getToken: {
				method: 'POST'
				,isArray: false
				,params: {
					method: 'getToken'
				}
			},
			decodeToken: {
				method: 'GET'
				,isArray: false
				,params: {
					method: 'decodeToken'
				}
			}
		}
	);

	this.getToken = function(cb,ecb) {
		cb = cb || angular.noop;
		ecb = ecb || angular.noop;

		var d = $q.defer();

		jwtResource.getToken(
			{}
			,function(data) {
				d.resolve(data);
				cb(data);
			}
			,function(error) {
				d.reject(error);
				ecb(error);
			}
		);

		return d.promise
	};

	this.decodeToken = function(token,cb,ecb) {
		cb = cb || angular.noop;
		ecb = ecb || angular.noop;

		var d = $q.defer();

		jwtResource.decodeToken(
			{token:token}
			,function(data) {
				d.resolve(data);
				cb(data);
			}
			,function(error) {
				d.reject(error);
				ecb(error);
			}
		);

		return d.promise
	}
}]);

bt.factory('FirebaseAuth',['$firebaseAuth',function($firebaseAuth) {
	return $firebaseAuth(ref);
}]);

bt.factory('FirebaseData',['$firebaseObject','$firebaseArray',function($firebaseObject,$firebaseArray) {
	return {
		getUser: function(userId) {
			if (userId) {
				var userObj = $firebaseObject.$extend({
					$$defaults: {
						firstName: ''
						,lastName: ''
						,email: ''
					}
					,getFullName: function() {
						console.log('this from Users.getFullName()',this, this.firstName + ' ' + this.lastName);
						return this.firstName + ' ' + this.lastName
					}
				});

				return new userObj(ref.child('users').child(userId));
			} else {
				return new $firebaseObject(ref.child('users'));
			}

		}
		,getBaby: function(babyId) {
			if (babyId) {
				var babyObj = $firebaseObject.$extend({
					$$defaults: {
						name: ''
						,gender: ''
						,birthDateTime: new Date().getTime()
					}
				});

				return new babyObj(ref.child('babies').child(babyId));
			} else {
				return new $firebaseArray(ref.child('babies'));
			}
		}
		,getBabyParents: function(babyId) {
			return new $firebaseArray(ref.child('babies').child(babyId).child('parents'));
		}
		,getParentBabies: function(parentId) {
			return new $firebaseArray(ref.child('babies').child(parentId).child('babies'));
		}

	}
}]);



bt.factory('CFauth',['$resource','$q','$localStorage',function($resource,$q,$localStorage) {
	var authResource = $resource(
		'/remote/authentication.cfc'
		,{}
		,{
			doLogin: {
				method: 'POST'
				,isArray: false
				,params: {
					method: 'doLogin'
				}
			}
			,doLogout: {
				method: 'POST'
				,isArray: false
				,params: {
					method: 'doLogout'
				}
			}
			,isLoggedIn: {
				method: 'GET'
				,isArray: false
				,params: {
					method: 'isLoggedIn'
				}
			}
			,getSessionData: {
				method: 'GET'
				,isArray: false
				,params: {
					method: 'getSessionData'
				}
			}
			,getUserInfo: {
				method: 'GET'
				,isArray: false
				,params: {
					method: 'getUserInfo'
				}
			}
		});

	return {
		loggedIn: false
		,doLogin: function(loginData,cb,ecb) {
			cb = cb || angular.noop;
			ecb = ecb || angular.noop;

			var d = $q.defer();
			authResource.doLogin(loginData,function(data) {
				d.resolve(data);
				cb(data);
				$localStorage.loggedInUserId = data.id;
				$localStorage.loggedInUserData = data;
			},function(error) {
				console.error(error);
				d.reject(error);
				ecb(error);
			});

			return d.promise;
		}
		,doLogout: function(cb,ecb) {
			cb = cb || angular.noop;
			ecb = ecb || angular.noop;

			var d = $q.defer();
			authResource.doLogout({},function(data) {
				d.resolve(data);
				cb(data);
				delete $localStorage.loggedInUserId;
				delete $localStorage.loggedInUserData;
			},function(error) {
				console.error(error);
				d.reject(error);
				ecb(error);
			});

			return d.promise;
		}
		,isLoggedIn: function(cb,ecb) {
			cb = cb || angular.noop;
			ecb = ecb || angular.noop;

			var d = $q.defer();
			authResource.isLoggedIn({},function(data) {
				d.resolve(data.loggedIn);
				cb(data.loggedIn);
			},function(error) {
				console.error(error);
				d.reject(error);
				ecb(error);
			});

			return d.promise;
		}
		,getUserInfo: function(userId,cb,ecb) {
			cb = cb || angular.noop;
			ecb = ecb || angular.noop;

			var d = $q.defer();
			authResource.getUserInfo({userId:userId},function(data) {
				d.resolve(data);
				cb(data);
			},function(error) {
				console.error(error);
				d.reject(error);
				ecb(error);
			});

			return d.promise;
		}
		,getSessionData: function(data,cb,ecb) {
			cb = cb || angular.noop;
			ecb = ecb || angular.noop;
			data = data || {};

			var d = $q.defer();
			authResource.getSessionData(data,function(data) {
				d.resolve(data);
				cb(data);
			},function(error) {
				console.error(error);
				d.reject(error);
				ecb(error);
			});

			return d.promise;
		}
	};
}]);

bt.controller('navController',['$scope','$rootScope','$route',function($scope,$rootScope,$route) {
	$scope.isActive = function(item) {
		var header = 'home';

		if ($route.current && $route.current.$$route)
			header = $route.current.$$route.selectedHeader || '';

		return {
			active:item === header
		};
	};

	$scope.logout = function() {
		$rootScope.$broadcast('event:logout');
	}
}]);

bt.directive('debugBlock',[function() {
	return {
		restrict: 'C'
		,link: function(scope,element,attrs) {
			scope.show = false;
			var pre = element.children('pre');
			pre.hide();

			element.on('click',function(evt) {
				scope.show = !scope.show;
				if (scope.show) {
					pre.show();
				} else {
					pre.hide();
				}
			})
		}
	}
}]);

bt.directive('inlineEdit',[function() {
	return {
		restrict: 'A'
		,link: function(scope,element,attrs) {
			console.log('attrs in inlineEdit directive',attrs);


		}
	}
}]);



bt.controller('applicationController',['$scope','$rootScope','FirebaseData',function($scope,$rootScope,FirebaseData) {
	$scope.controllerName = 'applicationController';

	$scope.appTitle = "BabyTrak";

	$scope.users = FirebaseData.getUser();


	/*
	* I am a helper function that converts string dates into Date objects.
	* I was created because Firebase does not currently support Date objects (6/26/15)
	*/
	$scope.dateFromString = function(input) {
		return new Date(input);
	};

	/*  Deprecated below this line */




}]);

bt.controller('loginPageController',['$scope','$rootScope','$localStorage','CFauth','jwtService','FirebaseAuth','FirebaseData',function($scope,$rootScope,$localStorage,CFauth,jwtService,FirebaseAuth,FirebaseData) {
	$scope.controllerName = 'loginPageController';

	$scope.authObj = FirebaseAuth;

	/*
	* I facilitate the user login with Social Media providers
	*/
	$scope.loginWithProvider = function (provider) {
		switch(provider) {
			case "google":
				$scope.authObj.$authWithOAuthPopup("google",{scope:'email'}).then(function(data) {
					console.log('response from authWithOAuthPopup',data);
				}).catch(function(error) {
					alert("Login error occurred. See console for details.");
					console.log('Login error',error);
				});
				break;
			case "babyTrak":

				break;
			default:
				alert("Error - no provider specified");
		}
	};

	/*
	* I take the auth data that comes back from a successful Firebase login and convert it to a standaradized user object that goes into the $rootScope
	 */
	$scope.setupCurrentUser = function(authData,cb,ecb) {
		cb = cb || angular.noop;
		ecb = ecb || angular.noop;

		try {
			console.log('firing setupCurrentUser with data',authData);

			var auth = authData.auth;

			var usrObj = {};

			switch(authData.provider) {
				case "google":
					var userData = authData[auth.provider];
					usrObj.email 			= userData.email || '';
					usrObj.firstName 		= userData.cachedUserProfile.given_name || '';
					usrObj.lastName 		= userData.cachedUserProfile.family_name || '';
					usrObj.thumbnail 		= userData.cachedUserProfile.picture || '';
					usrObj.displayName 		= userData.displayName || '';
					break;
				case "custom":
					usrObj.email 			= auth.email || '';
					usrObj.firstName 		= auth.firstName || '';
					usrObj.lastName 		= auth.lastName || '';
					usrObj.thumbnail 		= auth.thumbnail || '';
					usrObj.displayName 		= auth.firstName + ' ' + auth.lastName;
					break;
			}

			// Update $scope.users and set $scope.currentUser
			var usr = FirebaseData.getUser(auth.uid);
			for (var key in usrObj) {
				usr[key] = usrObj[key];
			}
			usr.userId = auth.uid;
			usr.$save();
			$rootScope.currentUser = usr;

			$localStorage.loggedInUserId = auth.uid;
			$localStorage.loggedInUserData = usrObj;

			// Fire callback
			cb(usr);

		} catch(e) {
			alert('An error has occurred in setupCurrentUser');
			console.log('errorDump',e,authData);
		}
	};

	/*
	* I kick off the CF-Firebase dual login process.  I expect an object containing two keys: username and password
	 */
	$scope.doDualLogin = function(loginData) {
		// Do the CF login first
		CFauth.doLogin(loginData,function(data) {
			// Throw a flag to declare CF login was successful
			$rootScope.isLoggedIntoCF = true;
			//$scope.currentUser = data;

			// Kick off the firebase login process
			$scope.firebaseLogin();
		},function(error) {
			alert('error logging into CF');
			console.error(error);
			$scope.errorData = error.data;
		})
	};

	/*
	* I handle getting a JWT and initiate the Firebase login
	 */
	$scope.firebaseLogin = function() {
		jwtService.getToken(function(data) {
			//console.log('token from getToken',data);
			$scope.authObj.$authWithCustomToken(data.token);
		},function(error) {
			console.error('an error occurred getting a token',error);
		});
	};

	/*
	* I handle the logout
	 */
	$scope.doLogout = function() {
		//console.log('logging out');

		// Log out of CF first
		CFauth.doLogout(function(data) {
			$rootScope.isLoggedIntoCF = false;

			// Trigger the Firebase logout
			$scope.authObj.$unauth();

			//console.log("You have been logged out.");
		},function(error) {
			console.log('An error occurred logging out',error);
		})
	};

	/*
	* I ask the CF server if we're currently logged in
	 */
	$scope.isCfLoggedIn = function() {
		CFauth.isLoggedIn(function(data) {
			$rootScope.isLoggedIntoCF = data;
			//console.log('isCfLoggedIn?',data);
		});
	};

	/*
	* I get User info from the CF server.  My userId parameter is optional; if it is omitted I will return data for the currently logged in user
	 */
	$scope.getUserInfo = function(userId) {
		CFauth.getUserInfo(userId,function(data) {
			console.log('data back from getUserInfo',data);
		});
	};

	/*
	* I am an event listener that will trigger a logout
	 */
	$scope.$on('event:logout',function(evt,args) {
		$scope.doLogout();
	});

	/*
	* I am an event listenter that watches for login state changes in Firebase.  When a user is logged in, I kick off the creation of the user's data object in the $rootScope
	 */
	$scope.authObj.$onAuth(function(authData) {
		if (authData) {
			//console.log('User is logged in',authData);
			$rootScope.isLoggedIntoFirebase = true;
			$scope.setupCurrentUser(authData);
			/*$scope.currUserId = authData.uid;*/
			$rootScope.isLoggedIn = true;
		} else {
			$rootScope.isLoggedIntoFirebase = false;
			$rootScope.isLoggedIn = false;
		}
	});






	$scope.getSessionData = function() {
		CFauth.getSessionData({},function(data) {
			console.log('CF Session Scope',data);
		})
	};

	$scope.getAuthState = function() {
		var authData = $scope.authObj.$getAuth();
		if (authData) $scope.setupCurrentUser(authData);
		console.log('from getAuthState',authData);
	};


}]);




bt.controller('feedingController',['$scope',function($scope) {
	$scope.controllerName = 'feedController';

	$scope.init = function() {

	};
}]);

bt.controller('userListController',['$scope','FirebaseData',function($scope,FirebaseData) {
	$scope.controllerName = "userListController";

	$scope.viewSettings = {
		page: 'list'
	};

	$scope.showList = function() {
		$scope.viewSettings.page = 'list';
	};

	$scope.showUser = function(userId) {
		FirebaseData.getUser(userId).$loaded().then(function(data) {
			$scope.selectedUser = data;
			$scope.viewSettings.page = 'detail';
		});
	};

	$scope.editUser = function(userId) {
		FirebaseData.getUser(userId).$loaded().then(function(data) {
			console.log('data in then',data);
			$scope.editUser = data;
			$scope.viewSettings.page = 'edit';
		}).catch(function(error) {
			alert("Error loading user.  Check console for details");
			console.log('Error loading user',error);
		});
	}
}]);

bt.controller('babyListController',['$scope','$location','$firebaseArray','FirebaseData',function($scope,$location,$firebaseArray,FirebaseData) {
	$scope.controllerName = 'babyListController';

	$scope.init = function() {
		$scope.babies = FirebaseData.getBaby();
	};

	$scope.openBabyAddForm = function() {
		if (!$scope.babyAdd) {
			$scope.babyAdd = true;

			$scope.newBaby = {};

			$scope.newBaby.birthDateTime = new Date('02/17/15');
			/*
			$scope.newBaby.name = '';
			$scope.newBaby.gender = '';
			*/
		}
	};

	$scope.closeBabyAddForm = function() {
		$scope.babyAdd = false;
		delete $scope.newBaby;
	};

	$scope.saveNewBaby = function() {

		var d = new Date($scope.newBaby.birthDate);
		var time = $scope.newBaby.birthTime.match(/(\d+)(?::(\d\d))?\s*(p?)/);
		d.setHours( parseInt(time[1]) + (time[3] ? 12 : 0) );
		d.setMinutes( parseInt(time[2]) || 0 );
		console.log('parsed datetime', d );

		$scope.newBaby.birthDateTime = d.toString();

		console.log('firing saveNewBaby',$scope.newBaby);

		$scope.babies.$ref().transaction(function() {
			//console.log(babies);
			$scope.babies.$add($scope.newBaby).then(function(data) {
				console.log('in then for babies.$add',data);

				try {
					if (!$scope.newBaby.parents) {
						$scope.newBaby.parents = FirebaseData.getBabyParents(data.$id);
					}

					if ($scope.newBaby.parents.$indexFor($scope.currentUser.userId) == -1) {
						$scope.newBaby.parents.$add($scope.currentUser.userId);
					}
				} catch(err) {
					throw(err);
				}


				$scope.closeBabyAddForm();
			}).catch(function(error) {
				alert("Error occurred adding new baby.");
				console.log('Error in saveNewBaby',error);
			});

			console.log('I am in the transaction too!');
		})


	};



	$scope.addParent = function(parent) {
		// TODO: Write logic to add a parent to a baby:
		// - Check to see if Baby has a parents array
		// 	- if not, create it
		// - Add parent to the parents array
		// - Call service User(parent.$id) to get the user object aka Parent
		// - Check to see if Parent has a baby 	 .
	};
	/*$scope.getMaxBirthdate = function() {
		var now = new Date();
		return now.getFullYear() + '-' + (now.getMonth()+1) + '-' + (now.getDate());
	}*/

}]);

bt.controller('babyEditController',['$scope','Baby',function($scope,Baby) {
	$scope.controllerName = "babyEditController";


}]);




