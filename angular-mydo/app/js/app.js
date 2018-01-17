var App=angular.module('angel',['ui.bootstrap','ngResource','ui.router','ui.utils']);

App.run(['$rootScope', function($rootScope){
	$rootScope.user={
		 name:     'Nebulas',
    	job:      'web-developer',
   		picture:  'img/user/02.jpg'
	};
	$rootScope.app={
		layout:{
				isCollapsed: false
		}
	};

}]);
App.config(['$stateProvider','$locationProvider','$urlRouterProvider',function($stateProvider,$locationProvider,$urlRouterProvider) {
	$locationProvider.html5Mode(false);

	$urlRouterProvider.otherwise('/app/dashboard');

	$stateProvider
		.state('app',{
			url:'/app',
			abstract: true,
			templateUrl:'views/app.html'
		})
		.state('app.dashboard',{
			url:'/dashboard',
			controller:'dashv1Ctrl',
			templateUrl:'views/dashboard/dashboard-v1.html'
		})
		.state('app.dashboard_v2',{
			url:'/dashboard-v2',
			templateUrl:'views/dashboard/dashboard-v2.html'
		})
		.state('app.dashboard_v3',{
			url:'/dashboard-v3',
			templateUrl:'views/dashboard/dashboard-v3.html'
		})
		.state('page',{
			url:"/page",
			abstract:true,
			templateUrl:'views/pages/page.html'
		})
		.state('page.login',{
			url:'/login',
			templateUrl:'views/pages/login.html',
			controller:'loginFormCtrl'
		})
		.state('page.register',{
			url:'/register',
			templateUrl:'views/pages/register.html',
			controller:'signUpFormCtrl'
		})
		.state('page.recover',{
			url:'/recover',
			templateUrl:'views/pages/recover.html'
		})
		// .state('page.recover',{
		// 	url:'/recover',
		// 	templateUrl:'views/pages/recover.html'
			
		// })

}])

App.controller('AppCtrl', ['$scope','$rootScope','$state', function($rootScope,$scope,$state){
	$scope.toggleUserBlock=function(){
		$scope.$broadcast('toggleUserBlock')
	};
	$rootScope.$watch('app.layout.isCollapsed',function(newValue,oldValue){
		if(newValue === false){
			$rootScope.$broadcast('closeSidebarMenu')
		}
	});
}])
App.service('navsearch', function(){
	var navSearchSelector='form.navbar-form';
	return {
		toggle:function(){
			
			var navbarform=$(navSearchSelector);
			navbarform.toggleClass('open');
			var isOpen=navbarform.hasClass('open');
			navbarform.find('input')[isOpen ?'focus':'blur']();
		},
		dismiss:function(){
			$(navSearchSelector)
				.removeClass('open')
				.find('input[type="text"]').blur()
				.val('');


		}
	}
});
App.directive('searchOpen',['navsearch',function(navsearch){
	return {
		restrict:'A',
		controller: ['$scope','$element', function($scope,$element){
			$element
				.on('click',function(e){e.stopPropagation();})
				.on('click',navsearch.toggle);
		}]
	}
}]).directive('searchDismiss',['navsearch',function(navsearch){
	var inputSelector = '.navbar-form input[type="text"]';
	return {
		restrict:'A',
		controller:['$scope','$element',function($scope,$element){
			$(inputSelector)
				.on('click',function(e){e.stopPropagation()})
				.on('keyup',function(e){
					if(e.keyCode == 27){
						navsearch.dismiss();
					}
				});

			$(document).on('click',navsearch.dismiss);
			
			$element
				.on('click',function(e){e.stopPropagation();})
				.on('click',navsearch.dismiss);	


		}]

	};
}]);
App.directive('toggleFullscreen',function(){
	return {
		restrict:'A',
		link: function(scope,element,attrs){
			element.on('click',function(e){
				e.preventDefault();
				if(screenfull.enabled){
					screenfull.toggle();
					if (screenfull.isFullscreen) {
						$(this).children('em').removeClass('fa-compress').addClass('fa-expand');
					}else{
						$(this).children('em').removeClass('fa-expand').addClass('fa-compress');
					}
				}else{
					$.error('Fullscreen not enabled');
				}
			})
		}
	}
});
App.factory('sideBarList', ['$resource', function($resource){
	return $resource('./server/sidebar-menu.json', {}, {
		query:{method:'GET',isArray:true}
	})
}]);
App.controller('sideBarCtrl', ['$scope','$state','sideBarList', function($scope,$state,sideBarList){
	var collapseList=[];
	$scope.sideBarMenu=sideBarList.query();
	
	
	$scope.getPropClass=function(a){
		return (a.heading? 'nav-heading':'')
	};
	
	$scope.userBlockState = true;
	$scope.$on('toggleUserBlock', function(){
		$scope.userBlockState=!$scope.userBlockState;
	});
	
	$scope.addCollapse=function($Index){
		collapseList[$Index]=true;
	};
	$scope.isCollapse = function($Index) {
		
      return (collapseList[$Index]);
    };
	$scope.toggleSubnav=function($Index){
		if($('body').hasClass('aside-collapse')){
					
					return true;

				};
		collapseList[$Index]=!collapseList[$Index];
	};
	$scope.noToggleSubnav=function($Index){
		collapseList[$Index]=false;
	}
}]);
// App.directive('toggleCollapse',function(){
// 	return {
// 		restrict:'A',
// 		link:function(scope,element,attrs){
			
// 			element.on('click',function(e){
				
// 				e.preventDefault();
// 				$(this).toggleClass('open');
// 			})
// 		}
// 	}
// });
App.directive('sidebar',['$rootScope','$window',function($window,$scope){
	var $win  = $($window);
	var $body = $('body');
 	var $scope;
	var $sidebar; 

	return {
		restrict: 'EA',
		template: '<nav class="sideBar" ng-transclude></nav>',
		transclude: true,
		replace: true,
		link: function(scope,element,attrs){
			$scope=scope;
			$sidebar=element;
			
			var subNav=$();
			$sidebar.on('click','.nav>li',function(e){
					$(this).siblings('li').children('a').removeClass('open');
					$(this)
						.children('a')
						.addClass('open');
						
				if($('body').hasClass('aside-collapse')){
					
					subNav=toggleMenuItem($(this));

				};
				e.stopPropagation();

			});
			$(document).on('click',function(e){
				
				removeFloatingNav();
				//e.stopPropagation()
			});
			$scope.$on('closeSidebarMenu', function(){
				removeFloatingNav();
			});

			function removeFloatingNav(){
			
				$('.nav-floating').remove();
				//$('.sidebar li.open').removeClass('open');
			};
			function toggleMenuItem(listItem){
				removeFloatingNav();
				
				var ul=listItem.children('ul');
				var topDis=listItem.offset().top;

				var subNav = ul.clone().appendTo($('.aside'));
				
				
				subNav.addClass('nav-floating');
				var temp=topDis	+  subNav.height()	- $(window).height();
				subNav.css({
					position: 'fixed',
					left:'70px',
					top:topDis,
					bottom:temp>0 ? '0':'auto'
        		

				})
			};

		}
	}
}]);
App.factory('dashitem', ['$resource', function($resource){
	return $resource('./server/dashboard.json', {}, {
		query:{method:'GET',isArray:true}
	})
}]);
App.controller('dashv1Ctrl', ['$scope','dashitem',function($scope,dashitem){
	$scope.dashv1List=dashitem.query();
	console.log(new Date().toLocaleString( ))
	
}]);
App.directive('now',['dateFilter','$interval',function(dateFilter,$interval){
	return {
		restrict: 'E',
		link:function(scope,element,attrs){
			var format=attrs.format;

			function updateTime(){
				var dt = dateFilter(new Date(),format);
				element.text(dt);

			};
			updateTime();
			$interval(updateTime,1000);
		}

	}
}]);
App.controller('loginFormCtrl',['$scope',function($scope){
	$scope.account = {};
	$scope.placeholder="Enter email";
	$scope.login=function(){
		$scope.aMsg="";
		if($scope.loginForm.$valid){
			alert("login successfully");
		}else{

			$scope.loginForm.account_email.$dirty=true;
			$scope.loginForm.account_password.$dirty=true;
		}
	};
	

}]);
App.controller('signUpFormCtrl',['$scope',function($scope){
	$scope.account={};
}])