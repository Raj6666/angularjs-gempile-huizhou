// import auth from '../service/Authentification'
import swal from 'sweetalert2';
import AssessConfig from '../configs/AccessConfig';
import NG2Page from '../util/ng2Page';
// import jwt from 'jwt-simple';
// import Flatpickr from 'flatpickr';

let template = require('../../views/common/TopNav.html');

/* eslint-disable no-undef */
const env = CONFIG;
/* eslint-enable no-undef */

// let garnetUrl = '';
//
// switch (env) {
// 	case 'dev':
// 	case "devBuild":
// 		garnetUrl = 'http://192.168.6.20:8686/garnet/';
// 		break;
// 	case 'prodBuild':
// 		garnetUrl = 'http://188.5.51.165:28401/garnet/';
// 		break;
// 	default:
// 		garnetUrl = 'http://192.168.6.20:8686/garnet/';
// 		break;
// }

let timerSet = {
	main_menu: null,
	virtual_dtcqt_nav: null,
	software_analysis_nav: null,
};


/** 用户ID */
let userId = '';

/** 是否管理员 */
let isAdmin = '';

/**
 * Top Nav Component
 *
 * @export
 * @class TopNavController
 */
class TopNavController {

	/**
	 * Creates an instance of TopNavController.
	 *
	 * @param $state
	 * @param $scope
	 * @memberOf TopNavController
	 */
	constructor($state, $scope, $rootScope, HttpRequestService, $http, Auth) {
		this.$state = $state;
		this.$scope = $scope;
		this.$rootScope = $rootScope;
		this.HttpRequestService = HttpRequestService;
		this.$http = $http;
		this.auth = Auth;
	}


	/** initialize */
	$onInit() {
		this.$scope.userName = this.$rootScope.userName;
		this.$scope.showTopNavigator = true;
		this.$scope.mouseenterTopNav = true;
		this.$scope.topSelect = 1;
		this.initModulesForEnvHz();

		this.doAuthenticationHz();

		this.setMainModuleBlocksHz();


		this.contractionOrExpansion();
		this.setUser();

	}

	$doCheck() {
		this.setMainModuleBlocksHz();
	}

	/**显示用户名*/
	setUser() {
		if (!this.$scope.userName) {
			let userInfo = localStorage.getItem('gempileToken');
			if (userInfo) {
				//权限2.0
				this.$scope.userName = localStorage.getItem('user');
				//this.$scope.userName = jwt.decode(userInfo, 'secret').una;
			}
		}
	}

	// checkShow(){
	//     if($('.top-nav').is(':visible')){
	//         this.$rootScope.showTopNavigator = true;
	//     }
	// }
	// window.setInterval('checkShow()',50);


	/**
	 * 初始化惠州模块列表，决定模块是否显示
	 */
	initModulesForEnvHz() {
		this.$scope.enableHomeHz = false;	//首页
		this.$scope.enableSoftwareAnalysisHz = false; //软采分析
		this.$scope.enableComplaintAnalysisHz = false; //投诉分析
		this.$scope.enableSpecializedAnalysisHz = false; //专题分析
		this.$scope.enablePoorCoverageAreaAnalysisModuleHz = false;// 弱覆盖区域Gis分析
		this.$scope.enablePoorCoverageAreaTrendAnalysisModuleHz = false;// 弱覆盖区域趋势分析
		this.$scope.enableSoftMiningPoorAreaAnalysisModuleHz = false;// 软采质差小区分析
		this.$scope.enableUserDefinedAreaAnalysisModuleHz = false;// 自定义区域分析
		this.$scope.enableComplaintLabelAnalysisModuleHz = false;// 投诉标签分析
		this.$scope.enableComplaintRankingAnalysisModuleHz = false;// 投诉排行分析
		this.$scope.enableComplaintDataImportModuleHz = false;//数据录入
		this.$scope.enableIndicatorsDailyBulletinModuleHz = false;//指标每日短信通报
		this.$scope.enableAutomaticGenerationReportsModuleHz = false;//分析报告自动化生成
	}

	/**
	 * 模块鉴权
	 */
	async doAuthenticationHz() {
		this.$scope.enableHomeHz = await this.auth.doAuthentication('homePageNew');	//首页
		this.$scope.enablePoorCoverageAreaAnalysisModuleHz = await this.auth.doAuthentication('poorAreaGis');// 弱覆盖区域Gis分析
		this.$scope.enablePoorCoverageAreaTrendAnalysisModuleHz = await  this.auth.doAuthentication('poorAreaTrend');// 弱覆盖区域趋势分析
		this.$scope.enableSoftMiningPoorAreaAnalysisModuleHz = await  this.auth.doAuthentication('softMiningPoorAreaAnalysis');// 软采质差小区分析
		this.$scope.enableUserDefinedAreaAnalysisModuleHz = await this.auth.doAuthentication('userDefinedArea');// 自定义区域分析
		this.$scope.enableComplaintLabelAnalysisModuleHz = await this.auth.doAuthentication('complaintLabel');// 投诉标签分析
		this.$scope.enableComplaintRankingAnalysisModuleHz = await this.auth.doAuthentication('complaintRanking');// 投诉排行分析
		this.$scope.enableComplaintDataImportModuleHz = await this.auth.doAuthentication('complaintDataEntry');//数据录入
		this.$scope.enableIndicatorsDailyBulletinModuleHz = await this.auth.doAuthentication('indicatorsDailyBulletin');//指标每日短信通报
		this.$scope.enableAutomaticGenerationReportsModuleHz = await this.auth.doAuthentication('automaticGenerationReports');//分析报告自动化生成

		// 若存在软采分析模块则实现Angular框架的预加载
		// if(this.$scope.enableSoftMiningPoorAreaAnalysisModuleHz){
		// 	// console.log('预加载开始');
		// 	// NG2Page.preloadNG2Page();
		// }
	}

	/**
	 * 子模块全部没有，则隐藏父模块
	 */
	setMainModuleBlocksHz() {
		if (this.$scope.enablePoorCoverageAreaAnalysisModuleHz || this.$scope.enablePoorCoverageAreaTrendAnalysisModuleHz || this.$scope.enableSoftMiningPoorAreaAnalysisModuleHz) {
			this.$scope.enableSoftwareAnalysisHz = true; //软采分析
		} else {
			this.$scope.enableSoftwareAnalysisHz = false; //软采分析
		}

		if (this.$scope.enableComplaintDataImportModuleHz || this.$scope.enableComplaintLabelAnalysisModuleHz || this.$scope.enableComplaintRankingAnalysisModuleHz) {
			this.$scope.enableComplaintAnalysisHz = true; //投诉分析
		} else {
			this.$scope.enableComplaintAnalysisHz = false; //投诉分析
		}

		if (this.$scope.enableUserDefinedAreaAnalysisModuleHz || this.$scope.enableIndicatorsDailyBulletinModuleHz || this.$scope.enableAutomaticGenerationReportsModuleHz) {
			this.$scope.enableSpecializedAnalysisHz = true; //专题分析
		} else {
			this.$scope.enableSpecializedAnalysisHz = false; //专题分析
		}
	}

	goHome() {
		this.$state.go(localStorage.getItem('defaultPage') || "emptyPage");
	}

	/**
	 * 菜单下拉/上拉
	 *
	 * @param {String} selector
	 * @param {String} type
	 * @param {number} [speed=200]
	 *
	 * @memberOf TopNavController
	 */
	menuToggle(selector, type, speed = 200) {
		let target = $(document.querySelector(selector));
		if (type == 'in') {
			window.clearTimeout(timerSet[selector]);
			this.$scope.showTopNavigator = true;
			timerSet[selector] = setTimeout(() => {
				target.slideDown(speed);
			}, 300)
		} else {
			window.clearTimeout(timerSet[selector]);
			timerSet[selector] = setTimeout(() => {
				target.slideUp(speed);
			}, 200)
		}
	}

	/**
	 * 退出登录
	 */
	logout() {
		// let state = this.$state;
		// auth.logout(() => {
			localStorage.clear();
			window.location.href = AssessConfig.auth.login;
		//});
	}

	goNG2Page(url) {
        NG2Page.goNG2Page(url);
    }

    hideNG2Page() {
        NG2Page.hideNG2Page();
    }

	/** 根据用户权限跳转1.0 */
	/*goGarnet() {
	 /!** 获取当前用户的角色组 *!/
	 let userInfo = localStorage.getItem('gempileToken');

	 if (userInfo) {
	 userId = jwt.decode(userInfo, 'secret').uid;
	 isAdmin = jwt.decode(userInfo, 'secret').uad;
	 }

	 if (isAdmin == 1) {
	 window.open(garnetUrl + 'index.html');
	 } else {
	 swal({
	 title: '确定要修改密码吗？',
	 text: '您没有管理员权限，只能修改密码!',
	 showCancelButton: true,
	 confirmButtonColor: '#3085d6',
	 cancelButtonColor: '#d33',
	 confirmButtonText: '确定',
	 cancelButtonText: '取消',
	 }).then(() => {
	 swal({
	 title: '修改密码',
	 html: '<input type="password" id="oldPassword" class="swal2-input " placeholder="请输入原密码" style="margin:0 20px 15px;width:435px;">' +
	 '<input type="password" id="newPassword" class="swal2-input" placeholder="请输入新密码" style="margin:15px 20px;width:435px;">' +
	 '<input type="password" id="confirmPassword" class="swal2-input" placeholder="请确认密码" style="margin:15px 20px 0;width:435px;">',
	 preConfirm: function () {
	 return new Promise(resolve => {
	 resolve([
	 $('#oldPassword').val(),
	 $('#newPassword').val(),
	 $('#confirmPassword').val(),
	 ])
	 })
	 },
	 onOpen: function () {
	 $('#oldPassword').focus()
	 },
	 }).then(result => {
	 let oldPassword = result[0];
	 let newPassword = result[1];
	 let confirmPassword = result[2];
	 if (!(oldPassword && newPassword && confirmPassword)) {
	 swal('更改密码失败', '每项均不为空！');
	 return;
	 }
	 if (newPassword !== confirmPassword) {
	 swal('更改密码失败', '两次输入的密码不一致！');
	 return;
	 }
	 this.changePassword(oldPassword, newPassword);
	 }).catch(swal.noop)
	 })
	 }
	 }*/



	/**根据用户权限跳转2.0*/
	goGarnet() {
		window.open(AssessConfig.auth.garnet);
		//userId = JSON.parse(localStorage.getItem('userId'));
		/*if (JSON.parse(localStorage.getItem('user')).belongToGarnet == 'Y') {
			this.HttpRequestService.post('http://192.168.108.100:12306/garnet/api/v1.0/users/refreshtoken', {
				"token": localStorage.getItem('gempileToken'),
			}, {
				"appCode": "garnet",
				"refreshToken": localStorage.getItem('gempileToken'),
				"tenantIdList": [1],
				"userName": this.$scope.userName
			}, data => {
				if (data.code == 201) {
					window.open('http://192.168.108.100:12306/garnet/index.html');
				} else {
					swal({
						text: data.message,
						type: 'error',
						confirmButtonText: '确定',
					})
					$('.swal2-modal .swal2-title').hide();
				}
			})*/
		/*else {
			swal({
				title: '确定要修改密码吗？',
				text: '您没有管理员权限，只能修改密码!',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: '确定',
				cancelButtonText: '取消',
			}).then(() => {
				swal({
					title: '修改密码',
					html: '<input type="password" id="oldPassword" class="swal2-input " placeholder="请输入原密码" style="margin:0 20px 15px;width:435px;">' +
					'<input type="password" id="newPassword" class="swal2-input" placeholder="请输入新密码" style="margin:15px 20px;width:435px;">' +
					'<input type="password" id="confirmPassword" class="swal2-input" placeholder="请确认密码" style="margin:15px 20px 0;width:435px;">',
					preConfirm: function () {
						return new Promise(resolve => {
							resolve([
								$('#oldPassword').val(),
								$('#newPassword').val(),
								$('#confirmPassword').val(),
							])
						})
					},
					onOpen: function () {
						$('#oldPassword').focus()
					},
				}).then(result => {
					let oldPassword = result[0];
					let newPassword = result[1];
					let confirmPassword = result[2];
					if (!(oldPassword && newPassword && confirmPassword)) {
						swal('更改密码失败', '每项均不为空！');
						return;
					}
					if (newPassword !== confirmPassword) {
						swal('更改密码失败', '两次输入的密码不一致！');
						return;
					}
					this.changePassword(oldPassword, newPassword);
				}).catch(swal.noop)
			})
		}*/
	}


	/** 更改密码 */
	changePassword(oldPassword, newPassword) {
		let passwordReg = /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{8,20}$/;
		if (!passwordReg.test(newPassword)) {
			swal({
				text: "密码不符合要求: 长度需要大于等于8位，且同时包含大小写字母、数字和特殊字符!",
				type: 'warning',
				confirmButtonText: '确定',
				showCancelButton: false,
			});
			$('.swal2-modal .swal2-title').hide();
			return;
		}
		if (oldPassword == newPassword) {
			swal({
				text: "新密码不能与旧密码相同!",
				type: 'warning',
				confirmButtonText: '确定',
				showCancelButton: false,
			});
			$('.swal2-modal .swal2-title').hide();
			return;
		}
		//权限2.0
		let url = 'http://192.168.111.100:12306/garnet/api/v1.0/users/password';
		this.$http({
			method: 'PUT',
			url: url,
			headers: {'accessToken': localStorage.getItem('accessToken')},
			data: {
				userId: userId,
				password: oldPassword,
				newPassword: newPassword,
			}
		}).then((response) => {
				swal({
					text: '密码修改成功，请重新登录',
					type: 'success',
					confirmButtonText: '确定',
				}).then(() => {
					this.logout();
				})
				$('.swal2-modal .swal2-title').hide();
			}, () => {
				return swal('更改密码失败', '原密码不正确！');
			}
		)

		//权限1.0
		/*let url = garnetUrl + 'v1.0/password';
		 this.HttpRequestService.post(url, {
		 userId: userId,
		 password: oldPassword,
		 newPassword: newPassword,
		 }, null, () => {
		 return swal('更改密码成功', '');//, 'success'
		 }, () => {
		 return swal('更改密码失败', '原密码不正确！');//, 'error'
		 });*/
	}

	/**收缩顶部栏*/
	shrinkageTop() {
		this.$scope.showTopNavigator = false;
		NG2Page.slideUpNG2Page(false);
		this.$scope.topSelect = 2;
	}

	fixedTop() {
		this.$scope.topSelect = 1;
		this.$scope.showTopNavigator = true;
		NG2Page.slideUpNG2Page(true);
	}

	triggerTop() {
		this.$scope.showTopNavigator = !this.$scope.showTopNavigator;
		if(this.$scope.showTopNavigator){
			NG2Page.slideUpNG2Page(true);
			// console.log('显示');
		}else{
			NG2Page.slideUpNG2Page(false);
			// console.log('隐藏');
		}
	}

	//鼠标经过显示或隐藏
	contractionOrExpansion() {

		$(document).mousemove(e => {
			let scrollTop = e.pageY || e.clientY + document.body.scrollTop;
			if (this.$scope.topSelect === 2) {
				$('.nav-2rd-menu').mouseenter(() => {
					this.$scope.mouseenterTopNav = false;
				})
				$('.nav-2rd-menu').mouseleave(() => {
					this.$scope.mouseenterTopNav = true;
				})
				if (!this.$scope.showTopNavigator && scrollTop <= 15) {
					$('#triggerBtn').trigger('click');
				}
				if (this.$scope.showTopNavigator && this.$scope.mouseenterTopNav && scrollTop > 70) {
					$('#triggerBtn').trigger('click');
				}

			}
		});

		let NG2Page_html = $('#NG2Page');
		let MouseInNav = false;
		NG2Page_html.mouseleave((e) => {
			if(document.querySelector('#NG2Page').style.display === 'block' && this.$scope.topSelect === 2){
				let scrollTop = e.pageY || e.clientY + document.body.scrollTop;
				if(scrollTop < 0){
					$('#triggerBtn').trigger('click');
					MouseInNav = true;
				}
			}
		});
		NG2Page_html.mouseenter(() => {
			if(document.querySelector('#NG2Page').style.display === 'block' && this.$scope.topSelect === 2 && MouseInNav){
				$('#triggerBtn').trigger('click');
				MouseInNav = false;
			}
		});

	}
}

export const TopNav = {
	template,
	controller: TopNavController,
};

