/** Common */
import angular from 'angular';
import Flatpickr from 'flatpickr';
import {zh} from '../../node_modules/flatpickr/dist/l10n/zh.js'
import swal from 'sweetalert2';
import StateConfig from './configs/StateConfig';
import auth from './service/Authentification';
import AssessConfig from './configs/AccessConfig';
import NG2Page from './util/ng2Page';

/** Components*/
import {TopNav} from './components/TopNav';
import KeyChart from './controllers/newUserDefineArea/keyChart/keyChart.component';

/** Controllers */
import LoginController from './controllers/LoginController';
import PoorCoverageAreaAnalysisController from './controllers/PoorCoverageAreaAnalysisController';
import HomePageNewController from './controllers/HomePageNewController.js';
import PoorCoverageAreaTrendAnalysisController from './controllers/PoorCoverageAreaTrendAnalysisController';
import UserDefinedAreaAnalysisController from './controllers/UserDefinedAreaAnalysisController';
import ComplaintLabelAnalysisController from './controllers/ComplaintLabelAnalysisController';
import ComplaintRankingAnalysisController from './controllers/ComplaintRankingAnalysisController';
import ComplaintDataEntryController from './controllers/ComplaintDataEntryController';
import BusinessIndicatorTrendAnalysisController from './controllers/BusinessIndicatorTrendAnalysisController';
import IndicatorsDailyBulletinController from './controllers/IndicatorsDailyBulletinController';
import AutomaticGenerationReportsController from './controllers/AutomaticGenerationReportsController';
import EmptyPageController from './controllers/EmptyPageController';

/** Services */
import AngularAjaxService from './service/common/AngularAjaxService';
import { UserDefineAreaTemplateHttpService } from './controllers/newUserDefineArea/http/template.http';


/** Directives */
import BootstrapPageDirective from './directives/BootstrapPageDirective';
import JQGridDirective from './directives/JQGridDirective';
import HighchartsDirective from './directives/HighchartsDirective';
import './custom-pulgin/angularjs-dropdown-multiselect';
/** Factories */
import ExcelFactory from './factory/ExcelFactory';
import ConfirmFactory from './factory/ConfirmFactory';
import CheckDateFactory from './factory/CheckDateFactory';
import CheckInputFactory from './factory/CheckInputFactory';

/** Filters */
import SecurityMaskFilter from './filters/SecurityMaskFilter';
import UserDefineAreaFilter from './controllers/newUserDefineArea/formatDate.filter';

/** Styles */
import '../styles/App.scss';
import PopoverDirective from "./directives/PopoverDirective";

Flatpickr.localize(zh);

/**
 * Module gempileInWebApp
 *
 * @name gempileInWebApp
 * @description #gempileInWebApp
 *
 * Main module of the application.
 */
let app = angular.module('gempileInWebApp', [
    require('angular-ui-router'),
    require('angular-ui-grid'),
    'ui.grid.exporter',
    'ui.bootstrap',
    'ui.grid.resizeColumns',
    'ui.grid.pinning',
    'ui.grid.pagination',
    'ui.grid.selection',
    'ui.grid.edit',
    'ui.grid.autoResize',
	'angularjs-dropdown-multiselect',
    // 'ui.bootstrap',
    require('ng-infinite-scroll'),
    'infinite-scroll',
    require('angular-ui-bootstrap'),

]);
app.component('app', {
    template: require('../main.html'),
});

app.config(($stateProvider, $urlRouterProvider, $compileProvider, $controllerProvider) => {
	$urlRouterProvider.otherwise('login');///home/homePageNew
	app.registerCtrl = $controllerProvider.register;
	// set ui router
	StateConfig.states.map(state => {
		$stateProvider.state(state.stateRef, state.stateObj)
	})
}).run(['$rootScope', '$location', 'i18nService', '$state', 'Auth', ($rootScope, $location, i18nService, $state, auth) => {
	i18nService.setCurrentLang('zh-cn');

	if (!auth.loggedIn()) {
		//$state.go('login');
		//2.0
		//
		auth.logging();
		if (!auth.loggedIn()) {
			// window.location.href = 'http://192.168.108.100:12306/garnet/otherslogin.html?redirectUrl=http://localhost:8081/#!/home/emptyPage&appCode=hz_dt_platform';
			window.location.href = AssessConfig.auth.login;
		}
	}
	$rootScope.$on('$locationChangeStart', () => {
		if (!auth.loggedIn()) {
			//$state.go('login');
			//2.0
			auth.logging();
			if (!auth.loggedIn()) {
				// window.location.href = 'http://192.168.108.100:12306/garnet/otherslogin.html?redirectUrl=http://localhost:8081/#!/home/emptyPage&appCode=hz_dt_platform';
				window.location.href = AssessConfig.auth.login;
			}
			NG2Page.hideNG2Page();
		}
	});
	$rootScope.$on('$stateChangeStart', (event, toState) => {
		let targetPath = toState.url;
		if (auth.loggedIn()) {
			if (targetPath.includes('/') && (targetPath == '/home' || targetPath == '/login')) {
				event.preventDefault();
				$state.go(localStorage.getItem('defaultPage') || "emptyPage");
			}
			auth.doAuthentication(toState.name).then(result=>{
				if(new Date().getTime()-localStorage.getItem('loginTime')>30*60*1000){
					localStorage.clear();
					// window.location.href = 'http://192.168.108.100:12306/garnet/otherslogin.html?redirectUrl=http://localhost:8081/#!/home/emptyPage&appCode=hz_dt_platform';
					window.location.href = AssessConfig.auth.login;
					return;
				}
				if(!result){
					swal('', '用户没有访问该系统的权限！', 'warning');
					$('.swal2-modal .swal2-title').hide();
					event.preventDefault();
				}else if(toState.name==='emptyPage'){
					$state.go(localStorage.getItem('defaultPage') || "emptyPage");
				}
			})
		} else if (targetPath != '/login') {
			$state.go('login');
		}
	});
}])
    .factory('Excel', ExcelFactory)
    .factory('CheckDateUtils', CheckDateFactory)
    .factory('CheckInputUtils', CheckInputFactory)
    .factory('ConfirmFactory', ConfirmFactory)
    .service('HttpRequestService', AngularAjaxService)
    .service('UserDefineAreaTemplateService', UserDefineAreaTemplateHttpService)
	.service('Auth', auth)
	.controller('LoginController', LoginController)
    .controller('PoorCoverageAreaAnalysisController', PoorCoverageAreaAnalysisController)
    .controller('PoorCoverageAreaTrendAnalysisController',PoorCoverageAreaTrendAnalysisController)
    .controller('HomePageNewController',HomePageNewController)
    .controller('UserDefinedAreaAnalysisController',UserDefinedAreaAnalysisController)
    .controller('ComplaintLabelAnalysisController',ComplaintLabelAnalysisController)
    .controller('ComplaintRankingAnalysisController',ComplaintRankingAnalysisController)
	.controller('ComplaintDataEntryController',ComplaintDataEntryController)
	.controller('BusinessIndicatorTrendAnalysisController',BusinessIndicatorTrendAnalysisController)
	.controller('IndicatorsDailyBulletinController',IndicatorsDailyBulletinController)
	.controller('AutomaticGenerationReportsController',AutomaticGenerationReportsController)
	.controller('EmptyPageController',EmptyPageController)
    .directive('bootPage', ['$compile', $compile => new BootstrapPageDirective($compile)])
    .directive('jqgrid', () => new JQGridDirective())
    .directive('highcharts', () => new HighchartsDirective())
    .filter('SecurityMask', SecurityMaskFilter)
    .filter('formatUserDefineTime', UserDefineAreaFilter)
    .component('topNav', TopNav)
    .component('keyChart', KeyChart);

// angular.element(window).bind('load', () => {
//     NG2Page.preloadNG2Page();
// });
module.exports = {
    app,
};