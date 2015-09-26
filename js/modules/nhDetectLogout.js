var nhdl = angular.module('detectLogout',[]);

nhdl.config(['$httpProvider',function($httpProvider) {
	$httpProvider.interceptors.push('myHttpInterceptor');
}]);

nhdl.factory('myHttpInterceptor', function($q) {
	return {
		// optional method
		/*'request': function(config) {
		 // do something on success
		 return config;
		 }*/

		// optional method
		/*,'requestError': function(rejection) {
		 // do something on error
		 if (canRecover(rejection)) {
		 return responseOrNewPromise
		 }
		 return $q.reject(rejection);
		 }*/


		//,
		// optional method
		'response': function(response) {
			// Detect the term "loginPage" in the response; if it exists, bounce the user.  Obviously there is a better way to do this.
			if (typeof response.data == 'string' && response.data.indexOf('loginPage') > -1) {
				//alert('Your session has expired.  Please log in again.');
				//return {};
				window.location = '/';
			} else {
				//console.log('returning');
				return response;
			}
		}

		// optional method
		/*,'responseError': function(rejection) {
		 // do something on error
		 if (canRecover(rejection)) {
		 return responseOrNewPromise
		 }
		 return $q.reject(rejection);
		 }*/
	};
})