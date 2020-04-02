'use strict';
import APIS from '../configs/ApisConfig';
import jwt from 'jwt-simple';
import swal from 'sweetalert2';

/**
 * Login Controller
 *
 * @ngInject
 * @constructor
 * @export
 * @param $scope
 * @param $state
 * @param $timeout
 * @param HttpRequestService
 */
export default function LoginController($scope, $rootScope, $state, $timeout, HttpRequestService) {

	/*let errorTimer = null;
     $scope.message = {
     valid: false,
     text: '',
     class: 'text-danger',
     };
     $scope.isLogging = false;
     $scope.login = function () {
     if (checkForm()) {
     $scope.isLogging = true;
     HttpRequestService.post(APIS.auth.login,null,{
     userName : $scope.auth.user,
     password : $scope.auth.password,
     },response => {
     $scope.isLogging = false;
     if(response.authentication){
     localStorage.clear(); // remove later
     localStorage.setItem('gempile_auth_token',response.token);
     $state.go('home');
     }else{
     setErrorMessage({
     valid: true,
     text: response.rejectionMessage,
     })
     }
     },() => {
     setErrorMessage({
     valid : true,
     text : '出了一点问题，请稍后重试...',
     })
     })
     }
     };
     const checkForm = function () {
     let authInfo = $scope.auth;
     if (!authInfo || !authInfo.user || authInfo.user.includes(' ')) {
     setErrorMessage({
     valid: true,
     text: '请填写有效的用户名',
     });
     return false;
     }
     if (!authInfo.password) {
     setErrorMessage({
     valid: true,
     text: '密码不能为空',
     });
     return false;
     }
     return true;
     };
     const setErrorMessage = function (param) {
     $timeout.cancel(errorTimer);
     if (param === true) {
     $scope.message = Object.assign({}, {
     valid: false,
     text: '',
     });
     } else if (typeof param === 'object') {
     $scope.message = Object.assign({}, param);
     errorTimer = $timeout(() => setErrorMessage(true), 3000);
     }
     };*/

	/* eslint-disable */
	let env = CONFIG;
	/* eslint-enable */

	/** gempile 调用 garnet 接口 URL */
	let garnetPath = '';

	switch (env) {
		case 'dev':
		case "devBuild":
			garnetPath = 'http://192.168.6.20:8585/garnet/';
			break;
		case 'prodBuild':
			garnetPath = 'http://188.5.51.165:28401/garnet/';
			break;
		default:
			garnetPath = 'http://192.168.6.20:8585/garnet/';
			break;
	}


	/** 是否显示错误信息 */
	$scope.error = false;

	/** 获取当前时间 */
	let nowTime = $.now();

	/** 默认加载验证码 */
	$scope.src = garnetPath + 'kaptcha?nowTime=' + nowTime;

	/** 登录图片 */
	$scope.isLogging = false;

	/** 登录接口 */
	//权限2.0
	/*$scope.gar_login=()=>{
		if (checkUserInfo()){
			$scope.isLogging = true;
			HttpRequestService.post('http://192.168.111.100:12306/garnet/api/v1.0/users/login',{},{
				//captcha: $scope.captcha,
				"appCode": "gempile_hz_platform",
				// nowTime: nowTime,
				userName: $scope.username,
				password: $scope.password,
			},response=>{
				//console.log(response);
				if(response.code==201){
					$scope.isLogging = false;
					localStorage.setItem('gempileToken', response.refreshToken);
					localStorage.setItem('accessToken', response.accessToken);
					localStorage.setItem('user',JSON.stringify(response.user));
					$rootScope.managerLabel = JSON.parse(localStorage.getItem('user')).belongToGarnet=='Y' ? '权限管理' : '修改密码';
					let userTenantIdList=[]
					for(let key in response.userTenantNameAndIdMap){
						userTenantIdList.push(response.userTenantNameAndIdMap[key]);
					}
					let userTenantId=userTenantIdList[0];
					HttpRequestService.post('http://192.168.111.100:12306/garnet/api/v1.0/users/refreshtoken',{
						"token": response.refreshToken,
					},{
						"appCode": "gempile_hz_platform",
						"refreshToken": response.refreshToken,
						"tenantIdList":[userTenantId] ,
						"userName": response.user.userName
					},data=>{
						if(JSON.stringify(data.typeResourceListMap) == "{}"){
							swal('', '用户没有访问该系统的权限！', 'warning');
							$('.swal2-modal .swal2-title').hide();
							return;
						}
						let moduleArr ;
						for(let key in data.typeResourceListMap){
							moduleArr = data.typeResourceListMap[key];
						}
						//console.log(moduleArr)
						/!*let moduleArr = data.refreshTokenResourceList.filter(function (value) {
							return value["tenantId"] == userTenantId;
						});*!/
						localStorage.setItem('cityId',moduleArr[0].varchar00);
						localStorage.setItem('defaultPage', moduleArr[0].varchar01);
						localStorage.setItem('authorityModule', JSON.stringify(moduleArr));
						localStorage.setItem('loginTime', new Date().getTime());
						$state.go(localStorage.getItem('defaultPage'));
					})
				}else{
					$scope.error = true;
					$scope.errorMsg = response.message;
					$scope.isLogging = false;
				}
			})
		}
	}*/

	//1.0
	$scope.gar_login = () => {
		if (checkUserInfo()) {
			$scope.isLogging = true;
			HttpRequestService.post(garnetPath + 'sys/login?loginFrom=gempile', {}, {
				captcha: $scope.captcha,
				nowTime: nowTime,
				username: $scope.username,
				password: $scope.password,
			}, response => {
				if (response.code == 0) {//登录成功
					localStorage.setItem('garnetToken', response.garnetToken);
					localStorage.setItem('gempileToken', response.gempileToken);
					localStorage.setItem('cityId', jwt.decode(response.gempileToken, 'secret').cty);
					getCity();
					$scope.isLogging = false;
					$rootScope.managerLabel = (jwt.decode(response.gempileToken, 'secret').uad) ? '权限管理' : '修改密码';
					//parent.location.href = loginSuccessPath;
					// $state.go($rootScope.defaultPage);
				} else {
					$scope.error = true;
					$scope.errorMsg = response.msg;
					$scope.isLogging = false;
				}
			},()=>{
				$scope.error = true;
				$scope.errorMsg = '出了点问题，请稍后重试...';
				$scope.isLogging = false;
			});
		}
	};

	/** 获取城市权限 */
	const getCity = () => {
		HttpRequestService.get(APIS["city"], {
			"cityId": localStorage.getItem('cityId')
		}, data => {
			if(data==''){
				localStorage.setItem('defaultPage', 'emptyPage');
				localStorage.setItem('authorityModule', '');
				$state.go(localStorage.getItem('defaultPage'));
				return;
			}
			let cityArr = data.filter(function (value) {
				return value["type"] == "gempile-cmhznm-homePage";
			});
			let moduleArr = data.filter(function (value) {
				return value["type"] == "gempile-cmhznm-module";
			});
			localStorage.setItem('defaultPage', cityArr[0]["path"].split('/').pop());
			localStorage.setItem('authorityModule', JSON.stringify(moduleArr));
			$state.go(localStorage.getItem('defaultPage'));
			console.log(localStorage.getItem('defaultPage'));
		});
	};

	/** 刷新验证码 */
	$scope.refreshCode = () => {
		nowTime = $.now();
		$scope.src = garnetPath + 'kaptcha?nowTime=' + nowTime;
	};

	/** 校验用户信息  */
	const checkUserInfo = () => {
		if (!$scope.username) {
			$scope.error = true;
			$scope.errorMsg = '用户名不能为空';
			return false;
		}
		if (!$scope.password) {
			$scope.error = true;
			$scope.errorMsg = '密码不能为空';
			return false;
		}
		if (!$scope.captcha) {
			$scope.error = true;
			$scope.errorMsg = '验证码不能为空';
			return false;
		}
		return true;
	}
}
LoginController.$inject = ['$scope', '$rootScope', '$state', '$timeout', 'HttpRequestService'];