'use strict';

import jwt from 'jwt-simple';

/* eslint-disable no-console*/
const throwError = response => {
	if (response) {
		//console.log('RESPONSE:', response.data)
		if (response.config.param) {
			console.error(`Request Fail! [${response.config.method}] ${response.status} 
            ${response.statusText} ${response.config.url}?${$.param(response.config.params)}`);
		} else {
			console.error(`Request Fail! [${response.config.method}] ${response.status} ${response.statusText} ${response.config.url}`);
		}
	} else {
		console.error('No response !')
	}
};

/**
 * getUserName
 *
 */
let getUserName = () => {
	let token = localStorage.getItem('gempileToken');
	let userName = '';
	if (token) {
		userName = localStorage.getItem('user');
		/*try {
			userName = jwt.decode(token, 'secret').una;
		} catch (error) {
			userName = '';
		}*/
	}
	return userName;
};

/**
 * AngularAjaxService
 *
 *
 * @constructor
 * @export
 * @class AngularAjaxService
 */
export default class AngularAjaxService {
	constructor($http) {
		this.$http = $http
	}

	post(url, params, requestBody, callback, errorCatch = throwError) {
		if (params === null) {
			params = {};
		}
		params.userName = getUserName();
		this.$http.post(
			url, requestBody, {
				params,
			}
		).then(response => {
			callback(response.data);
		}, response => {
			errorCatch(response);
		});
	}

	put(url, params, requestBody, callback, errorCatch = throwError) {
		if (params === null) {
			params = {};
		}
		params.userName = getUserName();
		this.$http.put(
			url, requestBody, {
				params,
			}
		).then(response => {
			callback(response.data);
		}, response => {
			errorCatch(response);
		});
	}

	get(url, params, callback, errorCatch = throwError) {
		if (params === null) {
			params = {};
		}
		params.userName = getUserName();
		//params.cityOid = 860752;
		this.$http.get(
			url, {
				params,
			}
		).then(response => {
			callback(response.data);
		}, response => {
			errorCatch(response);
		});
	}

	delete(url, params, callback, errorCatch = throwError) {
		if (params === null) {
			params = {};
		}
		params.userName = getUserName();
		this.$http.delete(
			url, {
				params,
			}
		).then(response => {
			callback(response.data);
		}, response => {
			errorCatch(response);
		});
	}
}
AngularAjaxService.$inject = ['$http'];