var ref = new Firebase("https://babytrak.firebaseio.com");
var usersRef = new Firebase('https://babytrak.firebaseio.com/users');
var babyRef = new Firebase('https://babytrak.firebaseio.com/babies');

var bt = angular.module("babyTrak", ['firebase','nhUtils','ngRoute','ngResource'])
	.config(['$routeProvider','$nhLoginProvider',function($routeProvider,$nhLoginProvider) {
		$routeProvider
			.when('/',{
				templateUrl: 'partials/home.html'
				,selectedHeader: 'home'
				,controller: 'homePageController'
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
			.otherwise({ redirectTo: '/' });

		$nhLoginProvider.setFirebaseInstance('babytrak');
	}])
	.run(['$nhLogin',function($nhLogin) {
		var cu = $nhLogin.getUser();
		console.log('cu',cu);
	}]);


bt.factory('Auth',['$firebaseAuth',function($firebaseAuth) {
	return $firebaseAuth(ref);
}]);
// 7/6/15 - testing extending firebaseObject; added individual User factory
bt.factory('Users',['$firebaseObject',function($firebaseObject) {
	var Users = $firebaseObject.$extend({
		getFullName: function() {
			console.log('this from Users.getFullName()',this);
		}
	});

	return new Users(usersRef);
}]);
bt.factory('User',['$firebaseObject',function($firebaseObject) {
	var User = $firebaseObject.$extend({
		getFullName: function() {
			return this.firstName + ' ' + this.lastName;
			//console.log('this from User.getFullName()',this);
		}
		,monkeySee: function(input) {
			console.log('monkeyDo:',input);
		}
	});

	return function(userId) {
		return new User(usersRef.child(userId));
	}
}]);

bt.factory('Babies',['$firebaseArray',function($firebaseArray) {
	var Babies = $firebaseArray.$extend({
		placeholder: function(input) {
			console.log('placeholder',input);
		}
	});
	return new Babies(babyRef);
}]);
bt.factory('Baby',['$firebaseObject',function($firebaseObject) {
	var Baby = $firebaseObject.$extend({
		placeholder: function(input) {
			console.log('placeholder',input);
		}
	});

	return function(babyId) {
		return new Baby(babyRef.child(babyId));
	}
}])

bt.controller('navController',['$scope','$route',function($scope,$route) {
	$scope.isActive = function(item) {
		var header = 'home';

		if ($route.current && $route.current.$$route)
			header = $route.current.$$route.selectedHeader || '';

		return {
			active:item === header
		};
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


/*bt.provider('$nhmodal',function() {
	var $nhmodalProvider = {
		options: {
			animation: true
			,backdrop: true
			,keyboard: true
		}
		,$get: ['$injector','$rootScope','$q','$templateRequest','$controller',function($injector,$rootScope,$q,$templateRequest,$controller) {
			var $nhmodal = {};

			function getTemplatePromise(options) {
				if (options.template) {
					console.log('in getTemplatePromise, using q.when');
					return $q.when(options.template);
				} else {
					console.log('in getTemplatePromise, using templateRequest');
					$templateRequest(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl);
				}
			}

			function getResolvePromises(resolves) {
				console.log('in getResolvePromises',resolves)
				var promisesArr = [];
				angular.forEach(resolves,function(value) {
					if (angular.isFunction(value) || angular.isArray(value)) {
						console.log('in getResolvePromises, value is either function or array')
						promisesArr.push($q.when($injector.invoke(value)));
					} else if (angular.isString(value)) {
						console.log('in getResolvePromises, value is string');
						promisesArr.push($q.when($injector.get(value)));
					} else {
						console.log('in getResolvePromises, value is "other"');
						promisesArr.push($q.when(value));
					}
				});
				return promisesArr;
			}

			var promiseChain = null;
			$nhmodal.getPromiseChain = function() {
				return promiseChain;
			};

			$nhmodal.open = function(modalOptions) {
				var modalResultDeferred = $q.defer();
				var modalOpenedDeferred = $q.defer();
				var modalRenderDeferred = $q.defer();

			};
		}]
	}
});*/


bt.service('siteUser',['$rootScope',function($rootScope) {
	this.firstName = 'no';
	this.lastName = 'body';

	this.getFullName = function() {
		return this.firstName + ' ' + this.lastName;
	}
}]);

bt.provider('$nhLogin',function $nhLoginProvider() {
	var options = {
		firebaseInstance: 'default'
	};
	this.setFirebaseInstance = function(value) {
		console.log('setting firebaseInstance to %o',value);
		options.firebaseInstance = !!value;
	};

	this.$get = ['$rootScope','siteUser',function($rootScope,siteUser) {
		return {
			showLogin: function() {
				console.log('show the login form');
			}
			,logout: function() {
				console.log('log out');
			}
			,getLoginState: function() {
				if (!$rootScope.isLoggedIn) $rootScope.isLoggedIn = false;
				return $rootScope.isLoggedIn;
			}
			,getUser: function() {
				return $rootScope.currentUser;
			}
			,setUser: function(userData) {
				var usr = siteUser;
				for (var key in userData) {
					if (userData.hasOwnProperty(key)) usr[key] = userData[key];
				}
				$rootScope.currentUser = usr;
			}
			,getFirebaseInstance: function() {
				return options.firebaseInstance;
			}
		}
	}];
});

bt.controller('applicationController',['$scope','Auth','$location','Users','$firebaseObject',function($scope,Auth,$location,Users,$firebaseObject) {
	$scope.controllerName = 'applicationController';

	$scope.appTitle = "BabyTrak";

	$scope.currentUser = null;
	$scope.isLoggedIn = false;

	$scope.authObj = Auth;
	$scope.users = Users;

	/*
	* I am basically an event listener that response to changes in the auth object.  I provide a single, asynchronous place to put user-login logic.
	*/
	$scope.authObj.$onAuth(function(authData) {
		if (authData) {
			//console.log('User is logged in',authData);
			$scope.isLoggedIn = true;
			$scope.setupCurrentUser(authData);
		} else {
			//console.log('User is logged out');
			$scope.isLoggedIn = false;
			$scope.logout();
		}
	});

	/*
	* I digest the auth data, create a user object from it and add it to the list of users.
	* When done, I persist the user list so that any new/changed data gets saved.
	*/
	$scope.setupCurrentUser = function(authData,cb,ecb) {
		cb = cb || angular.noop;
		ecb = ecb || angular.noop;

		try {
			console.log('firing setupCurrentUser with data',authData);

			var auth = authData.auth;
			var userData = authData[auth.provider];

			var cur = {};
			cur.email = userData.email || '';
			cur.displayName = userData.displayName || '';

			switch(auth.provider) {
				case "google":
					cur.firstName = userData.cachedUserProfile.given_name || '';
					cur.lastName = userData.cachedUserProfile.family_name || '';
					cur.thumbnail = userData.cachedUserProfile.picture || '';
					break;
			}

			// Update $scope.users and set $scope.currentUser
			$scope.users[auth.uid] = cur;
			$scope.users[auth.uid].userId = auth.uid;
			$scope.users.$save();
			$scope.currentUser = $scope.users[auth.uid];

			// Fire callback
			cb(cur);

		} catch(e) {
			alert('An error has occurred');
			console.log('errorDump',e,authData);
		}
	};

	/*
	* I remove the current user object
	*/
	$scope.clearCurrentUser = function() {
		$scope.currentUser = null;
	};

	/*
	* I log a user out and return them to the home page
	*/
	$scope.logout = function() {
		$scope.clearCurrentUser();
		$scope.authObj.$unauth();
		$location.path('#/');
	};

	/*
	* I make sure the user is logged in.  If not, I boot them to the home page
	*/
	$scope.requireLogin = function() {
		if (!$scope.isLoggedIn) {
			$location.path('/');
		}
	};

	/*
	* I am a helper function that converts string dates into Date objects.
	* I was created because Firebase does not currently support Date objects (6/26/15)
	*/
	$scope.dateFromString = function(input) {
		return new Date(input);
	};

	/*  Deprecated below this line */
	$scope.doesUserExistInFirebase = function(uid) {
		var localRef = new Firebase('https://babytrak.firebaseio.com/users/' + uid);
		var user = $firebaseObject(localRef);

		user.$loaded().then(function() {
			return !user.hasOwnProperty('$value');
		});

	};



}]);

bt.controller('homePageController',['$scope',function($scope) {
	$scope.controllerName = 'homePageController';

	/*
	* I facilitate the user login with the Google
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
			default:
				alert("Error - no provider specified");
		}
	};


	/*  Deprecated below this line */
	$scope.getAuthState = function() {
		var authData = $scope.authObj.$getAuth();
		 if (authData) $scope.setupCurrentUser(authData);
		console.log('from getAuthState',authData);
	}
}]);




bt.controller('feedingController',['$scope',function($scope) {
	$scope.controllerName = 'feedController';

	$scope.init = function() {
		$scope.requireLogin();
	};
}]);

bt.controller('userListController',['$scope','User',function($scope,User) {
	$scope.controllerName = "userListController";

	$scope.editUser = function(userId) {
		console.log('firing editUser',userId);

		User(userId).$loaded().then(function(data) {
			console.log('data in then',data);
			$scope.theUser = data;
			$scope.showUserEditor = true;
		}).catch(function(error) {
			alert("Error loading user.  Check console for details");
			console.log('Error loading user',error);
		});
	}
}]);

bt.controller('babyListController',['$scope','$location','$firebaseArray','Babies',function($scope,$location,$firebaseArray,Babies) {
	$scope.controllerName = 'babyListController';

	$scope.init = function() {
		$scope.requireLogin();

		$scope.babies = Babies;
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
						$scope.newBaby.parents = new $firebaseArray();
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




