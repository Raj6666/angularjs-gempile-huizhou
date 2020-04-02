import jwt from 'jwt-simple';
import StateConfig from '../configs/StateConfig';
import AssessConfig from '../configs/AccessConfig';
import swal from 'sweetalert2';

/** states of roles */
const stateRefRoleGroups = {
	0: ['home', 'login', 'homePageNew', 'poorAreaGis', 'poorAreaTrend', 'userDefinedArea', 'complaintLabel', 'complaintRanking',
		'complaintDataEntry', 'indicatorsDailyBulletin', 'businessIndicatorTrend', 'automaticGenerationReports', 'emptyPage'],
	1: ['home', 'login', 'homePageNew', 'poorAreaGis', 'poorAreaTrend', 'userDefinedArea', 'complaintLabel', 'complaintRanking',
		'complaintDataEntry', 'indicatorsDailyBulletin', 'businessIndicatorTrend', 'automaticGenerationReports', 'emptyPage'],
};

/** 所有模块 */
const allModules = {
	1: 'poorAreaGis',
	2: 'poorAreaTrend',
	3: 'complaintLabel',
	4: 'complaintRanking',
	5: 'complaintDataEntry',
	6: 'userDefinedArea',
	7: 'indicatorsDailyBulletin',
	8: 'automaticGenerationReports',
};


// module.exports = {
export default class Authentification {
	constructor(HttpRequestService, $state) {
		this.http = HttpRequestService;
		this.$state = $state;
	}

	logging() {
		/**获取url中的地址*/
		let href = window.location.href;
		let paramString = href.split('?');
		let paramMaps = {};
		if (paramString.length > 1) {
			let paramKeyValues = paramString[1].split('&');
			paramKeyValues.map(keyValue => {
				let keyAndValue = keyValue.split('=');
				if (keyAndValue !== null && keyAndValue.length === 2) {
					paramMaps[keyAndValue[0]] = decodeURIComponent(keyAndValue[1]);
				}
			})
		}
		let tenantNameAndId = JSON.parse(paramMaps['tenantNameAndId'] == null ? '{}' : paramMaps['tenantNameAndId']);
		//console.log(tenantNameAndId);
		let userTenantIdList = [];
		for (let key in tenantNameAndId) {
			userTenantIdList.push(tenantNameAndId[key]);
		}
		let userTenantId = userTenantIdList[0];
		let accessToken = paramMaps['accessToken'] == null ? '' : paramMaps['accessToken'];
		let refreshToken = paramMaps['refreshToken'] == null ? '' : paramMaps['refreshToken'];
		let userId = paramMaps['userId'] == null ? '' : paramMaps['userId'];
		let userName = paramMaps['userName'] == null ? '' : paramMaps['userName'];
		if (userTenantIdList.length > 0 && userTenantId && accessToken && refreshToken && userId && userName) {
			localStorage.setItem('gempileToken', refreshToken);
			localStorage.setItem('accessToken', accessToken);
			localStorage.setItem('user', userName);
			localStorage.setItem('userId', userId);
			localStorage.setItem('userTenantId', userTenantId);
			localStorage.setItem('loginTime', new Date().getTime());
		}
	}

	/**
	 * logged in
	 *
	 * @returns
	 */
	loggedIn() {
		let token = localStorage.getItem('gempileToken');
		if (token) {
			//权限2.0 ，30分钟后退出登录
			//if (new Date().getTime() - localStorage.getItem('loginTime') <= 1000 * 60 * 30) {
			return true;
			//}

			//1.0
			/*try {
			 jwt.decode(token, 'secret');
			 return true;
			 } catch (error) {
			 return false;
			 }*/
		} else {
			return false;
		}
	}

	/**
	 * log out
	 *
	 * @param {Function} cb
	 */
	logout(cb) {
		/*localStorage.removeItem('gempileToken');
		 localStorage.removeItem('garnetToken');*/
		localStorage.clear();//一次性清空所有的localStorage
		if (cb) {
			cb();
		}
	}

	/**
	 * get Allow Modules
	 *
	 * @param roleIds
	 */
	getAllowModules() {
		let ownModules = ['home', 'login', 'emptyPage'];
		let authorityModule = JSON.parse(localStorage.getItem('authorityModule'));
		for (let i = 0; i < authorityModule.length; i++) {
			ownModules.push(authorityModule[i]['path'].split('/').pop());
		}
		return ownModules;
	}

	/**
	 * check authentication
	 *
	 * @param stateRef
	 */
	doAuthentication(stateRef) {
		return new Promise((resolve, reject) => {
			if (!JSON.parse(localStorage.getItem('authorityModule'))) {
				let refreshToken = localStorage.getItem('gempileToken');
				let userName = localStorage.getItem('user');
				let userTenantId = localStorage.getItem('userTenantId');
				this.http.post(AssessConfig.auth.resfreshToken, {
					"token": refreshToken,
				}, {
					"appCode": "hz_dt_platform",
					"refreshToken": refreshToken,
					"tenantIdList": [userTenantId],
					"userName": userName
				}, data => {
					if (!Object.keys(data.typeResourceListMap).length) {
						resolve(false);
					}

					let moduleArr;
					for (let key in data.typeResourceListMap) {
						moduleArr = data.typeResourceListMap[key];
					}
					localStorage.setItem('cityId', moduleArr[0].varchar00);
					localStorage.setItem('defaultPage', moduleArr[0].varchar01);
					localStorage.setItem('authorityModule', JSON.stringify(moduleArr));
					this.$state.go(localStorage.getItem('defaultPage') || "emptyPage");
					resolve(moduleArr);
				});
			} else {
				resolve(true);
			}
		})
			.then((result) => {
			return result && StateConfig.stateRefConfigs.includes(stateRef) && this.getAllowModules().includes(stateRef);

		});
	}
};
Authentification.$inject = ['HttpRequestService', '$state'];