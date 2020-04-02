import angular from 'angular';
import APIS from '../configs/ApisConfig';
import swal from 'sweetalert2';
import Flatpickr from 'flatpickr';
import {NOW, ONE_DAY_MS} from '../constants/CommonConst';
import Loading from '../custom-pulgin/Loading';
import StringUtils from '../util/StringUtils';

export default function IndicatorsDailyBulletinController($scope, HttpRequestService, $timeout, CheckInputUtils) {
	/**被选中的群组的索引*/
	let curSelectedIndex = 0;
	/**正在更改某群组的提示*/
	$scope.groupEditAlert = '';
	/**短信规则模块初始化选择*/
	$scope.selectTemplate = '';
	$scope.selectYesOrNo = '是';
	$scope.selectEnable = '启用';
	/**初始化短信规则时间控件的默认时间值*/
	let startSmsDefaultDate = null;
	let endSmsDefaultDate = null;
	let smsMomentDefaultDate = null;
	/**短信的开始和结束时间*/
	let startSmsDate;
	let endSmsDate;
	/**短信规则编辑的类型 添加|修改*/
	let ruleOperateType = '';
	/**查询的时间*/
	let timeSlots = '';
	/**模板编辑中的短信模板*/
	$scope.selectSMSTemplate = '';
	/**默认选中群组的第一条*/
	let curSelectIndex = 0;

	/**将时间戳转换成日期*/
	function timestampToTime(timestamp, type) {
		let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
		let Y = date.getFullYear() + '-';
		let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
		let D = date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate();
		let h = '  ' + (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
		let m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes());
		//let s = ':'+date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds();
		if (type === 1) {
			return Y + M + D + h + m;
		}
		if (type === 2) {
			return Y + M + D;
		}
	}

	/**获取某段字符串中包含某一字符的长度*/
	function patch(re, s) {
		if(s.indexOf(re)==-1){
			return 0
		}else{
			re = eval("/" + re + "/ig");
			return s.match(re).length;
		}
	}

	/**点击下拉箭头*/
	$scope.showSearchPanel = true;
	$scope.togglePanel = () => {
		$scope.showSearchPanel = !$scope.showSearchPanel;
		$('#edit-sms').slideToggle('normal');
	};
	/**2秒自动关闭提示框,type=2时在此处隐藏title*/
	const showAlert = (content, type) => {
		let swalCon =
			{
				html: '<div style="font-size:30px;font-weight:700;line-height:20px;margin-bottom:15px;color:rgba(0,0,0,.8)">操作提示</div><div style="font-size:20px;">' + content + '</div>',
				timer: 2000,
				showConfirmButton: false,
				allowOutsideClick: false,
				allowEscapeKey: false,
			};
		swal(swalCon).then(() => {
			;
		}, () => ({}));
		if (type == 2) {
			$('.swal2-modal .swal2-title').hide();
		}
	}
	/**警告框*/
	const warningAlert = (content) => {
		swal({
			text: content,
			type: 'warning',
			confirmButtonText: '确定',
			//showCancelButton: true,
		})
		$('.swal2-modal .swal2-title').hide();
	}

	/**添加修改的弹框标题*/
	const addNewMessageTitle = {
		'group': ['请输入群组名称', '确定添加群组：'],
		'user': ['请输入用户手机号码', '请输入用户手机号码，多个号码以“,”间隔', '确定新增用户：'],
		'modify': ['请输入新群组名称', '确定修改群组名为：'],
	};
	/**获取信息列表*/
	const getList = {
		/**短信模板列表*/
		smsTemplateList(){
			HttpRequestService.get(APIS.indicatorsDailyBulletin.taskList, {}, response => {
				$scope.taskList = response;
			})
		},
		groupList(){
			HttpRequestService.get(APIS.indicatorsDailyBulletin.groupsInfo, {}, data => {
				if (data != '') {
					for (let i = 0; i < data.length; i++) {
						for (let j = 0; j < data[i].ruleList.length; j++) {
							data[i].ruleList[j].startTime = timestampToTime(data[i].ruleList[j].startTime, 2);
							data[i].ruleList[j].endTime = timestampToTime(data[i].ruleList[j].endTime, 2)
						}
					}
				}
				$scope.smsGroupList = data;
				$scope.curSelectedGroup = data[curSelectIndex];
				if (curSelectIndex == 0) {
					$('ul.list-group li:first-of-type').addClass('active').siblings('li').removeClass('active');
				}
				$scope.groupEditAlert = '';
			})
		},
		getModuleOfSms(){
			let url = APIS.indicatorsDailyBulletin.getModuleOfSms;
			HttpRequestService.get(url, {}, response => {
				//console.log(response)
				$scope.smsTemplate = new Map();
				for (let i = 0; i < response.length; i++) {
					$scope.smsTemplate.set(response[i].name, response[i].template.replace(/\\n/g, "\n"))
				}
			})
		}
	}
	const update = {
		/**更新群组信息*/
		updateGroups(){
			let groupId = $scope.curSelectedGroup.groupId;
			let transitionGroup = angular.copy($scope.curSelectedGroup);
			if (transitionGroup.ruleList != '') {
				for (let j = 0; j < transitionGroup.ruleList.length; j++) {
					transitionGroup.ruleList[j].startTime = (new Date(transitionGroup.ruleList[j].startTime)).getTime();
					transitionGroup.ruleList[j].endTime = (new Date(transitionGroup.ruleList[j].endTime)).getTime();
				}
			}
			let updateGroup = transitionGroup;
			let url = APIS.indicatorsDailyBulletin.updateGroupAndRule;
			HttpRequestService.put(url, null, updateGroup, response => {
				showAlert('修改群组信息成功！', 2);
				getList.groupList();
			}, () => {
				showAlert('修改群组信息失败！', 2);
				getList.groupList();
			})
		},

		/**新增群组名称*/
		addNewGroup(name){
			let newGroup = {
				"gId": "",
				"name": "",
				"users": [],
				"ruleList": [],
			}
			newGroup.name = name;
			let url = APIS.indicatorsDailyBulletin.createGroup;
			HttpRequestService.post(url, null, newGroup, response => {
				showAlert('新增群组成功！', 2);
				getList.groupList();
			}, error => {
				showAlert('新增群组失败！', 2);
			})
		},
		/**编辑群组名称*/
		modifyGroup(name){
			$timeout(() => {
				$scope.groupEditAlert = $scope.curSelectedGroup.name;
				$scope.curSelectedGroup.name = name;
			}, 200);
		},
		/**新增用户*/
		addNewGroupUser(userName){
			$timeout(() => {
				$scope.curSelectedGroup.users.unshift(userName);
				$scope.groupEditAlert = $scope.curSelectedGroup.name;
			}, 200)
		},
	}


	/**首先加载的就是第一个群组*/
	$(document).ready(function () {
		$('ul.list-group li:first-of-type').addClass('active').siblings('li').removeClass('active');
	})
	/**点击群组后现展示群组成员以及短信规则*/
	$scope.selectCurGroup = (group, index) => {
		$scope.groupEditAlert = '';
		curSelectIndex = index;
		$scope.curSelectedGroup = group;
		$('ul.list-group li:nth-of-type(' + (index + 1) + ')').addClass('active').siblings('li').removeClass('active');
	}

	/**添加新的群组或者成员*/
	$scope.addNewMessage = (type, data) => {
		let inputValue = '';
		if (type === 'modify') {
			inputValue = data.name;
		}
		swal({
			html: '<div style="font-size:30px;font-weight:700;color:#595959;">' + addNewMessageTitle[type][0] + '</div>',
			input: 'text',
			inputPlaceholder: type === 'user' ? addNewMessageTitle[type][1] : addNewMessageTitle[type][0],
			inputValue: inputValue,
			showCancelButton: true,
			confirmButtonText: '确定',
			cancelButtonColor: '#DD3333',
			cancelButtonText: '取消',
			inputAttributes: {
				maxlength: type === 'add' ? 20 : null,
			},
			inputValidator(value){
				return new Promise((resolve, reject) => {
					if (value) {
						switch (type) {
							case 'group':
								if (!CheckInputUtils.legalChar(value)) {
									reject('群组名称不支持带有标点符号！')
									return;
								}
								for (let i of $scope.smsGroupList) {
									if (i.name === value) {
										reject('该群组已存在！')
										return;
									}
								}
								break;
							case 'user':
								if (!CheckInputUtils.legalManyPhone(value)) {
									reject('请输入11位正确的手机号码，多个号码以“,”间隔')
									return;
								}
								/**将重复的号码组成一个数组*/
								let duplicateNumberList = [];
								let tellList = value.split(',');
								for (let i = 0; i < tellList.length; i++) {
									if (patch(tellList[i], value) > 1) {
										reject('不能重复输入同一号码')
										return;
									}
									if ($scope.curSelectedGroup.users.indexOf(tellList[i]) > -1) {
										duplicateNumberList.push(tellList[i]);
									}
								}
								if (duplicateNumberList != '') {
									reject(duplicateNumberList + '成员已存在。')
									return;
								}
								break;
							case 'modify':
								for (let i of $scope.smsGroupList) {
									if (i.name === value && inputValue !== value) {
										reject('该群组已存在。')
									}
								}
								break;
							default:
								break;
						}
						resolve();
					} else {
						reject('输入内容不能为空！')
					}
				})
			}
		}).then(result => {
			if (result) {
				let users;
				if (type === 'user' && result.length > 23) {
					users = result.substring(0, 23) + '...';
				} else if (type === 'user' && result.length <= 23) {
					users = result;
				}
				swal({
					text: type === 'user' ? addNewMessageTitle[type][2] + users : addNewMessageTitle[type][1] + result,
					type: 'warning',
					confirmButtonText: '确定',
					showCancelButton: true,
					cancelButtonColor: '#DD3333',
					cancelButtonText: '取消',
				}).then(() => {
					switch (type) {
						case 'group':
							update.addNewGroup(result)
							break;
						case 'user':
							let tellList = result.split(',');
							for (let i = 0; i < tellList.length; i++) {
								update.addNewGroupUser(tellList[i])
							}
							break;
						case 'modify':
							update.modifyGroup(result)
							break;
						default:
							break;
					}

				})
			}
		}, () => ({}))
		$('.swal2-modal .swal2-title').hide();
	}

	/**删除群组*/
	$scope.deleteGroups = data => {
		let groupId = data.groupId;
		if (!data.groupId) {
			$scope.confrimContent = '请选择要删除的群组!';
			showAlert('请选择要删除的群组！', 2)
		} else {
			swal({
				text: '确定要删除群组：' + data.name,
				type: 'warning',
				confirmButtonText: '确定',
				showCancelButton: true,
				cancelButtonColor: '#DD3333',
				cancelButtonText: '取消',
			}).then(() => {
				let url = APIS.indicatorsDailyBulletin.deleteGroup + groupId;
				HttpRequestService.delete(url, null, () => {
					showAlert('删除群组成功！', 2);
					curSelectIndex = 0;
					getList.groupList();
					//$('ul.list-group li:first-of-type').addClass('active').siblings('li').removeClass('active');
				});
			})
			$('.swal2-modal .swal2-title').hide();
		}
	}
	/**删除用户*/
	$scope.deleteUser = data => {
		$scope.curSelectedGroup.users.remove(data);
		$scope.groupEditAlert = $scope.curSelectedGroup.name;
	}

	/**点击添加或编辑短信规则*/
	$scope.addOrModifyRuleModel = (type, data) => {
		ruleOperateType = type;
		if (type === 'add') {
			$timeout(() => {
				$('#addIndicatorsModal').show();
				$scope.repetitiveTask = false;
			}, 0);
			$scope.addOrModifySmsTask = '添加任务';
			/*$('#select_template option[value=""]').prop('selected', true);
			 $('#select_yesOrNo option[value="是"]').prop('selected', true);*/
			$scope.selectTemplate = '';
			startSmsDefaultDate = null;
			endSmsDefaultDate = null;
			smsMomentDefaultDate = null;
			$scope.selectYesOrNo = '是';
			$scope.selectEnable = '开启';
			startSmsDate = 0;
			endSmsDate = 0;
			smsMomentDefaultDate = '14:00';
			initSmsDatePick('add');
		}
		if (type === 'modify') {
			$scope.addOrModifySmsTask = '修改任务';
			$scope.selectTemplate = data.taskName;
			startSmsDefaultDate = data.startTime;
			endSmsDefaultDate = data.endTime;
			smsMomentDefaultDate = data.sendTime;
			$scope.selectEnable = data.delaySend;
			$scope.selectYesOrNo = data.enable;
			startSmsDate = new Date(data.startTime);
			endSmsDate = new Date(data.endTime);
			//console.log(data.startTime, data.endTime);
			initSmsDatePick('modify');
			$('#startSmsTimePicker').css('color', '#464a4c');
			$('#endSmsTimePicker').css('color', '#464a4c');
			if (endSmsDate < NOW) {
				warningAlert('该短信任务已经执行完毕，不支持修改！');
			} else {
				$timeout(() => {
					$('#addIndicatorsModal').show();
					$scope.repetitiveTask = false;
				}, 0);
			}
		}

		/**打开模态框之后点击确定按钮设置短信规则*/
		$scope.addSmsRule = () => {
			$scope.startSmsTimePicker = $('#startSmsTimePicker').val();
			$scope.endSmsTimePicker = $('#endSmsTimePicker').val();
			$scope.selectMoment = $('.select-moment').val();
			/*console.log('短信任务：'+$scope.selectTemplate)
			 console.log('开始时间：'+$scope.startSmsTimePicker)
			 console.log('结束时间：'+$scope.endSmsTimePicker)
			 console.log('发送时刻：'+$scope.selectMoment)
			 console.log('是否启用：'+$scope.selectYesOrNo)*/
			if ($scope.selectTemplate === '') {
				warningAlert('短信任务不能为空！');
				return;
			}
			if ($scope.startSmsTimePicker === '') {
				warningAlert('开始时间不能为空！');
				return;
			}
			if ($scope.endSmsTimePicker === '') {
				warningAlert('结束时间不能为空！');
				return;
			}
			if ($scope.selectMoment === '') {
				warningAlert('发送时刻不能为空！');
				return;
			}
			if (startSmsDate > endSmsDate) {
				showAlert('开始日期不能大于结束日期', 2);
				return;
			}
			if (ruleOperateType === 'add') {
				for (let i = 0; i < $scope.curSelectedGroup.ruleList.length; i++) {
					if ($scope.selectTemplate == $scope.curSelectedGroup.ruleList[i].taskName
						&& $scope.selectMoment == $scope.curSelectedGroup.ruleList[i].sendTime) {
						let newStartTime = (new Date($scope.startSmsTimePicker)).getTime();
						let newEndTime = (new Date($scope.endSmsTimePicker)).getTime();
						let oldStartTime = (new Date($scope.curSelectedGroup.ruleList[i].startTime)).getTime();
						let oldEndTime = (new Date($scope.curSelectedGroup.ruleList[i].endTime)).getTime();
						//console.log(newStartTime, newEndTime, oldStartTime, oldEndTime);
						if (!(newEndTime < oldStartTime || newStartTime > oldEndTime)) {
							$scope.oldStartDate = $scope.curSelectedGroup.ruleList[i].startTime;
							$scope.oldEndDate = $scope.curSelectedGroup.ruleList[i].endTime;
							$scope.oldSendTime = $scope.curSelectedGroup.ruleList[i].sendTime;
							$scope.repetitiveTask = true;
							return;
						}
					}
				}
				let smsRules = {
					"id": '',
					"taskName": '',
					"startTime": '',
					"endTime": '',
					"sendTime": '',
					"enable": '',
					"groupId": '',
					"taskId": '',
					'delaySend': '',
				}
				if ($scope.selectTemplate == "用户使用流量统计") {
					smsRules.taskId = 1;
				} else if ($scope.selectTemplate == "各行政区用户流入流出情况") {
					smsRules.taskId = 2;
				} else if ($scope.selectTemplate == "各行政区业务流量情况") {
					smsRules.taskId = 3;
				} else if ($scope.selectTemplate == "全市TOP3业务情况") {
					smsRules.taskId = 4;
				} else if ($scope.selectTemplate == "重点区域情况") {
					smsRules.taskId = 5;
				} else if ($scope.selectTemplate == "市场动态监控需求-日租卡监控") {
					smsRules.taskId = 6;
				} else if ($scope.selectTemplate == "市场动态监控需求-春节漫入漫出监控") {
					smsRules.taskId = 7;
				} else if ($scope.selectTemplate == "汇总模板1") {
					smsRules.taskId = 8;
				}
				smsRules.groupId = $scope.curSelectedGroup.groupId;
				smsRules.taskName = $scope.selectTemplate;
				smsRules.startTime = $scope.startSmsTimePicker;
				smsRules.endTime = $scope.endSmsTimePicker;
				smsRules.sendTime = $scope.selectMoment;
				smsRules.enable = $scope.selectYesOrNo;
				smsRules.delaySend = $scope.selectEnable;
				$scope.curSelectedGroup.ruleList.unshift(smsRules);
			}
			if (ruleOperateType === 'modify') {
				data.taskName = $scope.selectTemplate;
				data.startTime = $scope.startSmsTimePicker;
				data.endTime = $scope.endSmsTimePicker;
				data.sendTime = $scope.selectMoment;
				data.enable = $scope.selectYesOrNo;
				data.delaySend = $scope.selectEnable;
			}
			$('#addIndicatorsModal').hide();
			$scope.groupEditAlert = $scope.curSelectedGroup.name;
		}
	}

	/**点击删除短信规则*/
	$scope.deleteRuleModel = (data) => {
		$scope.curSelectedGroup.ruleList.remove(data);
		$scope.groupEditAlert = $scope.curSelectedGroup.name;
	}

	/**点击模态框中取消按钮模态框消失*/
	$scope.hideModal = () => {
		$('#addIndicatorsModal').hide();
	}

	/**点击更新按钮更新修改*/
	$scope.updateGroups = () => {
		swal({
			text: '是否更新群组' + $scope.curSelectedGroup.name + '?',
			type: 'warning',
			confirmButtonText: '确定',
			showCancelButton: true,
			cancelButtonColor: '#DD3333',
			cancelButtonText: '取消'
		}).then(() => {
			//发送请求修改并重新请求列表
			update.updateGroups()
			//getList.groupList()
		})
		$('.swal2-modal .swal2-title').hide();
	}

	/**点击取消按钮取消修改*/
	$scope.cancelUpdate = () => {
		swal({
			text: '确定取消以上修改？',
			type: 'warning',
			confirmButtonText: '确定',
			showCancelButton: true,
			cancelButtonColor: '#DD3333',
			cancelButtonText: '取消'
		}).then(() => {
			getList.groupList()
		}, () => {
		})
		$('.swal2-modal .swal2-title').hide();
	}

	/**初始化短信任务时间*/
	const initSmsDatePick = (type) => {
		let startSmsDatePicker;
		let endSmsDatePicker;
		let smsMomentPicker;
		let startSmsPickerConfig = {
			defaultDate: startSmsDefaultDate,
			minDate: type == 'add' ? timestampToTime(NOW, 2) : 0,
			maxDate: 0,
			//disable:[date=>date.getTime()<NOW],
			onChange(selectedDates){
				let selectedDateTime = selectedDates[0].getTime();
				startSmsDate = selectedDateTime;
				if (endSmsDatePicker) {
					endSmsDatePicker.set('enable', [date => date.getTime() >= selectedDateTime]);
				}
				if (type === 'add') {
					/*if (startSmsDate < (NOW - ONE_DAY_MS)) {
					 showAlert('开始日期不能小于当天日期',2);
					 $('#startSmsTimePicker').css('color', 'red');
					 } else {
					 $('#startSmsTimePicker').css('color', '#464a4c');
					 }*/
					if ($('#endSmsTimePicker').val() == '') {
						endSmsDate = startSmsDate
					}
				}
				//console.log(endSmsDate, startSmsDate)
				if (startSmsDate > endSmsDate) {
					showAlert('开始日期不能大于结束日期', 2);
					$('#endSmsTimePicker').css('color', 'red');
				} else {
					$('#endSmsTimePicker').css('color', '#464a4c');
				}
			}
		};
		let endSmsPickerConfig = {
			defaultDate: endSmsDefaultDate,
			minDate: type == 'add' ? timestampToTime(NOW, 2) : 0,
			maxDate: 0,
			onChange(selectedDates){
				let selectedDateTime = selectedDates[0].getTime();
				endSmsDate = selectedDateTime;
				if (startSmsDate <= endSmsDate) {
					$('#endSmsTimePicker').css('color', '#464a4c');
				} else {
					showAlert('结束日期不能小于开始日期', 2);
					$('#endSmsTimePicker').css('color', 'red');
				}
			}
		};
		let smsMomentPickerConfig = {
			defaultDate: smsMomentDefaultDate,
			enableTime: true,
			noCalendar: true,
			dateFormat: "H:i",
			time_24hr: true,
			minDate: "14:00",
			maxDate:'20:00',
			minuteIncrement: 60,
			/*onOpen(){
			 if (type == 'add') {
			 //smsMomentDefaultDate = '13:00';
			 console.log(11111);
			 smsMomentPicker.set('defaultDate','14:00');
			 }
			 }*/
		}
		$(document).ready(() => {
			startSmsDatePicker = new Flatpickr(document.getElementById('startSmsTimePicker'), startSmsPickerConfig);
			endSmsDatePicker = new Flatpickr(document.getElementById('endSmsTimePicker'), endSmsPickerConfig);
			smsMomentPicker = new Flatpickr(document.querySelector('.select-moment'), smsMomentPickerConfig);
		})
	}

	/**初始化查询时间控件*/
	let startInquireDate;
	let endInquireDate;
	const initInquireDatePick = () => {
		let startInquireDatePicker;
		let endInquireDatePicker;
		let startInquirePickerConfig = {
			minDate: 0,
			maxDate: 0,
			onChange(selectedDates){
				let selectedDateTime = selectedDates[0].getTime();
				startInquireDate = selectedDateTime;
				if (endInquireDatePicker) {
					endInquireDatePicker.set('enable', [date => date.getTime() >= selectedDateTime]);
				}
				if (startInquireDate > endInquireDate) {
					showAlert('开始日期不能大于结束日期', 2);
					$('#endInquirePicker').css('color', 'red');
				} else {
					$('#endInquirePicker').css('color', '#464a4c');
				}
			}
		};
		let endInquirePickerConfig = {
			minDate: 0,
			maxDate: 0,
			onChange(selectedDates){
				let selectedDateTime = selectedDates[0].getTime();
				endInquireDate = selectedDateTime;
				if (startInquireDate <= endInquireDate) {
					$('#endInquirePicker').css('color', '#464a4c');
				}
			}
		};
		$(document).ready(() => {
			startInquireDatePicker = new Flatpickr(document.querySelector('.start-date-time'), startInquirePickerConfig);
			endInquireDatePicker = new Flatpickr(document.querySelector('.end-date-time'), endInquirePickerConfig);
		})
	}

	/**点击通知短信发送短信*/
	$('#sendBtn').click(() => {
		if ($scope.curSelectedGroup == '' || $scope.curSelectedGroup == undefined) {
			warningAlert('群组为空，请先创建群组！');
			return;
		}
		if ($scope.curSelectedGroup.users == '') {
			warningAlert('所选群组的成员列表为空，请先创建成员或选择其他群组！');
			return;
		}
		if ($scope.groupEditAlert != '') {
			warningAlert('请先选择是否更新，再进行下步操作！');
			return;
		}
		/*先清空文本框内的值*/
		$('#smsContent').val('');
		$('#mySmsModal').modal();
	});
	/**点击发送按钮*/
	$scope.sendSms = () => {
		if ($('#smsContent').val() == '') {
			showAlert('短信内容不能为空', 2);
			return;
		}
		$('#mySmsModal').modal('hide');
		swal({
			text: '确定要向群组 ' + $scope.curSelectedGroup.name + ' 发送定制短信？',
			type: 'warning',
			confirmButtonText: '确定',
			showCancelButton: true,
			cancelButtonColor: '#DD3333',
			cancelButtonText: '取消',
		}).then(() => {
			let url = APIS.indicatorsDailyBulletin.sendSms;
			let sendContent = {
				message: $('#smsContent').val(),
				phones: $scope.curSelectedGroup.users,
				groupName: $scope.curSelectedGroup.name
			}
			//Loading.isLoading('#smsContent');
			//$('#send').html('正在发送...');
			HttpRequestService.post(url, null, sendContent, response => {
				showAlert('短信发送成功', 2);
				//Loading.hideLoading('#smsContent');
				//$('#send').html('发送');
			}, () => {
				showAlert('短信发送失败', 2);
				//Loading.hideLoading('#smsContent');
				//$('#send').html('发送');
			})
		})
		$('.swal2-modal .swal2-title').hide();
	}

	/**切换短信模板名称*/
	$scope.selSmsTemplate='请选择模板';
	let countNumber;
	let temText;
	const switchTemplate = (name)=>{
		$scope.selSmsTemplate=name;
		$('.selected-button').text(name);
		temText = $scope.smsTemplate.get($scope.selSmsTemplate)
		$('#modifyContent').val(temText);
		countNumber = patch('{XXX}',$('#modifyContent').val());
	}
	$scope.selectedTem=(temName)=>{
		switchTemplate(temName);
		/*temText = $scope.smsTemplate.get($scope.selSmsTemplate)
		if($scope.selSmsTemplate=='请选择模板'){
			switchTemplate(temName);
		}else{
			if($('#modifyContent').val()!=temText){
				swal({
					text: '您正在修改"'+$scope.selSmsTemplate+'"模板，切换模板后内容复原，确定要切换模板吗？',
					type: 'warning',
					confirmButtonText: '确定',
					showCancelButton: true,
					cancelButtonColor: '#DD3333',
					cancelButtonText: '取消'
				}).then(() => {
					switchTemplate(temName);
				})
				$('.swal2-modal .swal2-title').hide();
			}else{
				switchTemplate(temName);
			}
		}*/
	}
	/**编辑模板*/
	/*$(document).ready(function () {
		$('#SMSTemplate').change(function () {
			$('#modifyContent').val($scope.smsTemplate.get($scope.selectSMSTemplate));
		})
	})*/
	/**更新模板*/
	$scope.updateSmsTemplate = () => {
		if($scope.selSmsTemplate==''||$scope.selSmsTemplate==null){
			warningAlert('请选择短信模板！');
			return;
		}
		if($('#modifyContent').val()==''){
			warningAlert('短信模板内容不能为空！');
			return;
		}
		let number = patch('{XXX}',$('#modifyContent').val());
		//console.log(countNumber,number);
		if(countNumber!=0&&countNumber!=number){
			warningAlert('占位符的数量发生了改变，无法更新');
			return;
		}
		swal({
			text: '确定要修改该短信模板吗？',
			type: 'warning',
			confirmButtonText: '确定',
			showCancelButton: true,
			cancelButtonColor: '#DD3333',
			cancelButtonText: '取消'
		}).then(() => {
			let newTemplate = {
				taskId: null,
				name: '',
				template: ''
			}
			newTemplate.name = $scope.selSmsTemplate;
			newTemplate.template = $('#modifyContent').val();
			let url = APIS.indicatorsDailyBulletin.updateModuleOfSms;
			HttpRequestService.post(url, {}, newTemplate, response => {
				showAlert('更新模板成功！', 2);
				getList.getModuleOfSms();
				$('#template_editor').modal('hide');
			},()=>{
				showAlert('更新模板失败！', 2);
			})
		})
		$('.swal2-modal .swal2-title').hide();
	}

	/**取消更新模板*/
	$scope.openSmsTemplate = () =>{
		$('.selected-button').text('请选择模板');
		$scope.selSmsTemplate='请选择模板';
		$('#modifyContent').val('');
		temText='';
	}

	/**初始化表格*/
	let rowTemplate = `
    <div ng-mouseover="rowStyle={'background-color': '#D3F1FF'}; grid.appScope.onRowHover(this);" ng-mouseleave="rowStyle={}">
<div  ng-style="rowStyle" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + '-' + col.uid + '-cell'"
class="ui-grid-cell" ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader }" role="{{col.isRowHeader ? 'rowheader' : 'gridcell'}}" ui-grid-cell>
</div></div>
    `;
	const initSmsGrid = () => {
		$scope.smsPushRecordOptions = {
			rowTemplate,
			rowHeight: 30,
			columnDefs: [
				{name: 'sendTime', displayName: '短信推送时间', width: 200,},
				{name: 'taskName', displayName: '短信任务', width: 260,},
				{name: 'group', displayName: '用户组', width: 260,},
				{name: 'users', displayName: '成员号码'},
			],
			enableSorting: true,//是否支持排序(列)
			enableVerticalScrollbar: 1,//表格的垂直滚动条 (两个都是 1-显示,0-不显示)
			exporterCsvFilename: '短信推送记录.csv',
			exporterOlderExcelCompatibility: true,
			enablePaginationControls: true,
			//paginationCurrentPage: 1, //当前的页码
			paginationPageSize: 10, //每页显示个数
			paginationPageSizes: [10, 30, 50], //每页显示个数选项
			paginationTemplate: './views/templates/ui-grid/pageControlTemplate.html',
		}
		$scope.smsPushRecordOptions.appScopeProvider = $scope;
		$scope.smsPushRecordOptions.onRegisterApi = function (gridApi) {
			$scope.gridApi = gridApi;
		};
	}

	/**点击查询后的数据*/
	$scope.doQuery = () => {
		$('.noAnalysis').hide();
		$scope.startInquireDate = $('#startInquirePicker').val();
		$scope.endInquireDate = $('#endInquirePicker').val();
		if ($scope.startInquireDate === '') {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择开始日期!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		if ($scope.endInquireDate === '') {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择结束日期!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		if (startInquireDate > endInquireDate) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '开始日期不能大于结束日期!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		/**将时间日期转化成时间戳*/
		let sDate = ($scope.startInquireDate).replace(/-/g, '/');
		let eDate = ($scope.endInquireDate).replace(/-/g, '/') + ' 23:59';
		let date1 = new Date(sDate).getTime();
		let date2 = new Date(eDate).getTime();
		timeSlots = date1 + ',' + date2;
		requestData(timeSlots);
	}

	/**查询接口*/
	const requestData = (time) => {
		/***请求表格接口*/
		let url = APIS.indicatorsDailyBulletin.historySmsRecords;
		HttpRequestService.get(url, {
			timeSlots: time,
		}, response => {
			if (response == '') {
				$('.noAnalysis').show();
			}
			for (let i = 0; i < response.length; i++) {
				response[i].sendTime = timestampToTime(response[i].sendTime, 1);
			}
			$scope.smsPushRecordOptions.data.length = 0;
			$scope.smsPushRecordOptions.paginationCurrentPage = 1;
			$scope.smsPushRecordOptions.data = response;
		}, () => {
			$scope.smsPushRecordOptions.data.length = 0;
			$('.noAnalysis').show();
		})
	}

	/**加载页面时自动获取前一天的数据*/
	let yesterdayDate = timestampToTime(NOW - ONE_DAY_MS, 2);
	let autoTimeSlots = new Date(yesterdayDate + ' 00:00').getTime() + ',' + new Date(yesterdayDate + ' 23:59').getTime();
	requestData(autoTimeSlots);

	/** 初始化加载Controller */
	const initController = () => {
		initSmsGrid();
		initInquireDatePick();
		getList.groupList();
		getList.smsTemplateList();
		getList.getModuleOfSms();
	};
	initController();
}
IndicatorsDailyBulletinController.$inject = ['$scope', 'HttpRequestService', '$timeout', 'CheckInputUtils'];