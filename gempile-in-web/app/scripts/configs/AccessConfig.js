/* eslint-disable */
let env = CONFIG;
/* eslint-enable */
let garnetSysPath = '';
let redirectPath = '';
switch (env) {
	case 'dev':
		garnetSysPath = 'http://192.168.6.20:8585/garnet/';
		redirectPath = 'http://localhost:8081/#!/home/emptyPage&appCode=hz_dt_platform';
		break;
	case "devBuild":
		garnetSysPath = 'http://192.168.6.20:8585/garnet/';
		redirectPath = 'http://192.168.6.20:8585/gempile-fe-web-hz/#!/home/emptyPage&appCode=hz_dt_platform';
		break;
	case "sitBuild":
		garnetSysPath = '/garnet/';
		redirectPath = '/gempile-fe-web-hz/#!/home/emptyPage&appCode=hz_dt_platform';
		break;
	case 'prodBuild':
		garnetSysPath = 'http://188.5.51.165:28401/garnet/';
		redirectPath = 'http://188.5.51.165:28401/gempile-fe-web-hz/#!/home/emptyPage&appCode=hz_dt_platform';
		break;
	default:
		garnetSysPath = 'http://192.168.108.100:12306/garnet/';
		redirectPath = 'http://localhost:8081/#!/home/emptyPage&appCode=hz_dt_platform';
		break;
}
module.exports = {
	/**  登陆 */
	auth: {
		login: garnetSysPath + 'otherslogin.html?redirectUrl=' + redirectPath,
		garnet: garnetSysPath + 'index.html',
		resfreshToken: garnetSysPath + 'api/v1.0/users/refreshtoken'
	},
};