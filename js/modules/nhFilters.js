var nhUtils = angular.module('nhUtils',[]);

nhUtils.filter('jsonFull', function () {
		return function (object) {
			return JSON.stringify(object, function (key, value) {
				return value;
			}, '  ');
		};
	});
nhUtils.filter('without', function() {
		return function(input, filterArray, filterKey) {
			var ret = [];
			if(!filterArray || !filterArray.length)
				return input;
			if(!filterKey) {
				angular.forEach(input, function(val) {
					if(!_.contains(filterArray, val))
						ret.push(val);
				});
			} else {
				var inputKeys = _.pluck(input, filterKey);
				var filterKeys = _.pluck(filterArray, filterKey);

				angular.forEach(inputKeys, function(val, idx) {
					if(!_.contains(filterKeys, val))
						ret.push(input[idx]);
				});
			}
			return ret;
		}
	});
nhUtils.filter('renderHTML', ['$sce', function($sce){
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}]);
nhUtils.filter('customCurrency',function($filter) {
		var currencyFilter = $filter('currency');
		return function(amount) {
			if (amount < 0) {
				var amt = currencyFilter(amount);
				amt = amt.replace('(','');
				amt = amt.replace(')','');
				return '<span class="negative-balance"> -' + amt + '</span>';
			} else {
				return currencyFilter(amount);
			}

		}
	});
nhUtils.filter('YesNo',function() {
		return function(x) {
			if (x.length == 0) {
				return '';
			} else if (x) {
				return 'Yes';
			} else {
				return 'No';
			}
		}
	});


nhUtils.directive('ngRightClick',function($parse) {
		return function(scope, element, attrs) {
			var fn = $parse(attrs.ngRightClick);
			element.bind('contextmenu', function(event) {
				scope.$apply(function() {
					event.preventDefault();
					fn(scope, {$event:event});
				});
			});
		};
	});

