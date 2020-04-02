/**
 * Created by richstone on 2018/3/22.
 */
'use strict';
import APIS from '../configs/ApisConfig';
import Flatpickr from 'flatpickr';
import swal from 'sweetalert2';
import Loading from '../custom-pulgin/Loading';
import {NOW, ONE_DAY_MS, ONE_HOUR_MS} from '../constants/CommonConst';

export default function AutomaticGenerationReportsController($scope, $state, $filter, HttpRequestService, CheckDateUtils) {
	/**报告类型*/
	$scope.reportsType = ['节假日报告', '行政区月报'];
	$scope.selectedReportsType = $scope.reportsType[0] ? $scope.reportsType[0] : '';

	/**默认行政区*/
	$scope.selectedArea = '';
	/**默认的表格*/
	$scope.pageSelect = 1;

	/**行政区*/
	$scope.areas = [];
	let cityOid = localStorage.getItem('cityId');
	let areaUrl = APIS.autoGenerateReport.district + cityOid;
	HttpRequestService.get(areaUrl, {}, (response) => {
		$scope.areas = response;
	}, () => {
		$scope.areas = [];
	});

	/**点击选择图表类型*/
	$scope.selectReportsType = thisType => {
		$scope.selectedReportsType = thisType;
		timePicker();
	};
	/**切换图表类型图片*/
	$scope.isSelectReportsType = thisIcon => $scope.selectedReportsType == thisIcon ? 'images/icon_checked.png' : 'images/icon_unchecked.png';

	/**时间错误提示框*/
	$scope.endDateCheckHelp = {
		valid: false,
		text: '',
	};
	$scope.usualDateCheckHelp = {
		valid: false,
		text: '',
	};

	/**添加时条件的错误提示*/
	const errorAlert = (content) => {
		swal({
			showCloseButton: true,
			title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
			text: content,
			allowOutsideClick: false,
			confirmButtonText: '确定',
			confirmButtonClass: 'sure-class',
		})
	};

	/**实时的检测开始时间和结束时间*/
	const onVerifyEndDate = () => {
		if ($scope.startTime > $scope.endTime) {
			$scope.$apply(() => {
				$scope.endDateCheckHelp = {
					valid: true,
					text: '开始时间不能大于结束时间',
				};
				$('#endPicker').css('color', 'red');
			})
		} else {
			$scope.$apply(() => {
				$scope.endDateCheckHelp = {
					valid: false,
					text: '开始时间不能大于结束时间',
				};
				$('#endPicker').css('color', '#464a4c');
			})
		}
		if ($scope.endTime > $scope.startTime + 7 * ONE_DAY_MS) {
			$scope.$apply(() => {
				$scope.endDateCheckHelp = {
					valid: true,
					text: '开始时间与结束时间间隔不能超过7天',
				};
				$('#endPicker').css('color', 'red');
			})
		}
	};

	/**实时的检测开始时间和平日时间*/
	const onVerifyUsualDate = () => {
		if ($scope.startTime < $scope.usualTime) {
			$scope.$apply(() => {
				$scope.usualDateCheckHelp = {
					valid: true,
					text: '平日日期需早于节日开始日期',
				};
				$('#usualPicker').css('color', 'red');
			})
		} else {
			$scope.$apply(() => {
				$scope.usualDateCheckHelp = {
					valid: false,
					text: '平日日期需早于节日开始日期',
				};
				$('#usualPicker').css('color', '#464a4c');
			})
		}
		if ($scope.startTime > $scope.usualTime + 31 * ONE_DAY_MS) {
			$scope.$apply(() => {
				$scope.usualDateCheckHelp = {
					valid: true,
					text: '平日日期与节日开始日期相差不得超过31天',
				};
				$('#usualPicker').css('color', 'red');
			})
		}
	};

	/**初始化时间控件*/
	const timePicker = () => {
		let startPicker;
		let endPicker;
		let usualPicker;
		let startPickerConfig = {
			onChange(selectedDate) {
				let selectedDateTime = selectedDate[0].getTime();
				$scope.startTime = selectedDateTime;
				if (endPicker) {
					endPicker.set('enable', [date => (date.getTime() - selectedDateTime) < 7 * ONE_DAY_MS && date.getTime() >= selectedDateTime])
				}
				if (usualPicker) {
					usualPicker.set('enable', [date => date.getTime() < selectedDateTime && selectedDateTime - date.getTime() < 31 * ONE_DAY_MS])
				}
				onVerifyEndDate();
				onVerifyUsualDate();
			}
		};
		let endPickerConfig = {
			onChange(selectedDate) {
				let selectedDateTime = selectedDate[0].getTime();
				$scope.endTime = selectedDateTime;
				onVerifyEndDate();
			}
		};
		let usualPickerConfig = {
			onChange(selectedDate) {
				let selectedDateTime = selectedDate[0].getTime();
				$scope.usualTime = selectedDateTime;
				onVerifyUsualDate();
			}
		};
		$(document).ready(() => {
			startPicker = new Flatpickr(document.getElementById('startPicker'), startPickerConfig);
			endPicker = new Flatpickr(document.getElementById('endPicker'), endPickerConfig);
			usualPicker = new Flatpickr(document.getElementById('usualPicker'), usualPickerConfig);
		})
	};

	/**添加按钮*/
	$scope.addReport = () => {
		if ($scope.selectedReportsType == '节假日报告') {
			if ($scope.holidayName == undefined || $scope.holidayName == '') {
				errorAlert('节假日名称不能为空');
				return;
			}
			if ($scope.startTime == undefined || $scope.startTime == '') {
				errorAlert('开始日期不能为空');
				return;
			}
			if ($scope.endTime == undefined || $scope.endTime == '') {
				errorAlert('结束日期不能为空');
				return;
			}
			if ($scope.usualTime == undefined || $scope.usualTime == '') {
				errorAlert('平日日期不能为空');
				return;
			}
			if ($scope.endDateCheckHelp.valid == true || $scope.usualDateCheckHelp.valid == true) {
				errorAlert('错误的日期');
				return;
			}
			swal({
				text: '确定要添加任务吗？',
				type: 'warning',
				confirmButtonText: '确定',
				showCancelButton: true,
				cancelButtonColor: '#DD3333',
				cancelButtonText: '取消'
			}).then(() => {
				let url = APIS.autoGenerateReport.autoReport;
				let data = {
					reportName: $scope.holidayName,
					startDate: $filter('date')(new Date($scope.startTime), 'yyyyMMdd'),
					endDate: $filter('date')(new Date($scope.endTime), 'yyyyMMdd'),
					normalDate: $filter('date')(new Date($scope.usualTime), 'yyyyMMdd'),
					cityOid: cityOid,
					type:0,
					district:''
				};
				HttpRequestService.post(url, null, data, () => {
					swal("", "添加成功!", "success");
					$('.swal2-modal .swal2-title').hide();
					if($scope.pageSelect==1){
						getReportGridData('1');
					}else if($scope.pageSelect==2){
						$scope.switchReports(1);
					}

				}, error => {
					swal("", error.data.errorMessage, "error");
					$('.swal2-modal .swal2-title').hide();
				});
				$scope.holidayName = '';
				timePicker();
			}, () => {
			});
			$('.swal2-modal .swal2-title').hide();
		} else {
			if ($scope.selectedArea == undefined || $scope.selectedArea == '') {
				errorAlert('行政区不能为空');
				return;
			}
			if ($scope.selectedMonth == undefined || $scope.selectedMonth == '') {
				errorAlert('月份不能为空');
				return;
			}
			swal({
				text: '确定要添加任务吗？',
				type: 'warning',
				confirmButtonText: '确定',
				showCancelButton: true,
				cancelButtonColor: '#DD3333',
				cancelButtonText: '取消'
			}).then(() => {
				let url = APIS.autoGenerateReport.autoReport;
				let data = {
					reportName: '',
					startDate: $filter('date')(new Date($scope.selectedMonth), 'yyyyMM'),
					endDate: '',
					normalDate: '',
					cityOid: cityOid,
					type:1,
					district:$scope.selectedArea
				};
				HttpRequestService.post(url, null, data, () => {
					swal("", "添加成功!", "success");
					$('.swal2-modal .swal2-title').hide();
					if($scope.pageSelect==2){
						getReportGridData('2');
					}else if($scope.pageSelect==1){
						$scope.switchReports(2);
					}
				}, error => {
					swal("", error.data.errorMessage, "error");
					$('.swal2-modal .swal2-title').hide();
				});
				$scope.selectedArea = '';
				$scope.selectedMonth = '';
				timePicker();
			}, () => {
			});
			$('.swal2-modal .swal2-title').hide();
		}
	};

	/**切换报告表格*/
	$scope.switchReports = (pageSelect) => {
		if (pageSelect === 1 && $scope.pageSelect === 2) {
			$scope.pageSelect = 1;
			getReportGridData('1');
		} else if (pageSelect === 2 && $scope.pageSelect === 1) {
			$scope.pageSelect = 2;
			//$scope.reportOptions.data.length = 0;
			getReportGridData('2');
		}
	};

	/** 请求表格数据 */
	let getReportGridData = pageSelect => {
		let url = APIS.autoGenerateReport.autoReport;
		switch (pageSelect) {
			// 节假日报告数据
			case '1':
				$scope.holidayReportOptions.data = '';
				HttpRequestService.get(url, {
					page: 1,
					pageSize: -1,
					cityOid: cityOid,
					type:0
				}, response => {
					$scope.holidayReportOptions.data = response.entities;
					$scope.holidayReportOptions.totalItems = response.totalCount;
				});
				break;
			case '2':
				$scope.administrativeReportOptions.data = '';
				HttpRequestService.get(url, {
					page: 1,
					pageSize: -1,
					cityOid: cityOid,
					type:1
				}, response => {
					$scope.administrativeReportOptions.data = response.entities;
					$scope.administrativeReportOptions.totalItems = response.totalCount;
				});
				break;
			default:
				return '';
		}
	};

	/** 删除节假日报告 */
	$scope.deleteHolidayReport = row => {
		swal({
			text: '是否确定删除任务？',
			type: 'warning',
			confirmButtonText: '确定',
			showCancelButton: true,
			cancelButtonColor: '#DD3333',
			cancelButtonText: '取消'
		}).then(() => {
			let url = APIS.autoGenerateReport.autoReport + '/' + row.entity.id;
			HttpRequestService.delete(url, null, () => {
				swal("", "删除成功!", "success");
				$('.swal2-modal .swal2-title').hide();
				if($scope.pageSelect==1){
					let index = $scope.holidayReportOptions.data.indexOf(row.entity);
					$scope.holidayReportOptions.data.splice(index, 1);
				}else{
					let index = $scope.administrativeReportOptions.data.indexOf(row.entity);
					$scope.administrativeReportOptions.data.splice(index, 1);
				}
			}, () => {
				swal("", "删除失败!", "error");
				$('.swal2-modal .swal2-title').hide();
			});
		}, () => {
		});
		$('.swal2-modal .swal2-title').hide();
	};

	/** 下载节假日报告 */
	$scope.downloadHolidayReport = id => {
		window.location = APIS.autoGenerateReport.downloadReport + '/' + id;
	};

	/** 导出CSV */
	$scope.exportReportToCsv1 = () => {
		if ($scope.holidayReportOptions.data ==null) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '没有相关数据！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		let uiGridExporterService = $scope.gridApi.exporter;
		uiGridExporterService.csvExport("all", "all");
	};
	$scope.exportReportToCsv2 = () => {
		if ($scope.administrativeReportOptions.data==null) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '没有相关数据！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		let uiGridExporterService = $scope.gridApi.exporter;
		uiGridExporterService.csvExport("all", "all");
	};

	/** 特殊表头配置 */
	let stateTemplate = '<div class="ui-grid-cell-contents ng-binding ng-scope"><span>{{row.entity.state === 1 ? "已生成": "待生成"}}</span></div>';
	let operationTemplate = `<div class="ui-grid-cell-contents ng-binding ng-scope">
                <i class="fa fa-window-close-o fa-lg" style="color: red;cursor: pointer;" ng-click="grid.appScope.deleteHolidayReport(row)"></i> &nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-download fa-lg" style="color: #555455" ng-if="row.entity.state === 0"></i>
                <i class="fa fa-download fa-lg" style="color: #72BFF0;cursor: pointer;" ng-if="row.entity.state === 1" ng-click="grid.appScope.downloadHolidayReport(row.entity.id)"></i>
                </div>`;

	/** 节假日报告表头配置 */
	let holidayColumns = [
		{name: 'reportName', displayName: "报告名称"},
		{name: 'startDate', displayName: "节日开始日期"},
		{name: 'endDate', displayName: "节日结束日期"},
		{name: 'normalDate', displayName: "平日日期"},
		{name: 'expectCompleteDate', displayName: "报告预计生成时间"},
		{name: 'state', displayName: "状态", cellTemplate: stateTemplate},
		{name: 'operation', displayName: "操作", cellTemplate: operationTemplate},
	];

	let administrativeColumns = [
		{name: 'reportName', displayName: "报告名称"},
		{name: 'startDate', displayName: "月份"},
		{name: 'expectCompleteDate', displayName: "报告预计生成时间"},
		{name: 'state', displayName: "状态", cellTemplate: stateTemplate},
		{name: 'operation', displayName: "操作", cellTemplate: operationTemplate},
	];

	/** 表格初始化 */
	const initHolidayReportGrid = () => {
		$scope.holidayReportOptions = {
			rowHeight: 30,
			columnDefs: holidayColumns,
			enableSorting: true,//是否支持排序(列)
			enableColumnMenu: false,
			exporterCsvFilename: '节假日报表.csv',
			exporterOlderExcelCompatibility: true,
			paginationTemplate: './views/templates/ui-grid/pageControlTemplate.html',
			enablePaginationControls: true, // 不允许异步分页，即一次性请求所有数据，前端自动分页
			useExternalPagination: false, // 允许分页
			paginationPageSizes: [10, 20, 30], //每页显示个数选项
			paginationCurrentPage: 1, //当前的页码
			paginationPageSize: 10, //每页显示个数
			totalItems: 0,
		};
		$scope.holidayReportOptions.appScopeProvider = $scope;
		$scope.holidayReportOptions.onRegisterApi = function (gridApi) {
			$scope.gridApi = gridApi;
		};
	};
	const administrativeReportOptions = () => {
		$scope.administrativeReportOptions = {
			rowHeight: 30,
			columnDefs: administrativeColumns,
			enableSorting: true,//是否支持排序(列)
			enableColumnMenu: false,
			exporterCsvFilename: '节假日报表.csv',
			exporterOlderExcelCompatibility: true,
			paginationTemplate: './views/templates/ui-grid/pageControlTemplate.html',
			enablePaginationControls: true, // 不允许异步分页，即一次性请求所有数据，前端自动分页
			useExternalPagination: false, // 允许分页
			paginationPageSizes: [10, 20, 30], //每页显示个数选项
			paginationCurrentPage: 1, //当前的页码
			paginationPageSize: 10, //每页显示个数
			totalItems: 0,
		};
		$scope.administrativeReportOptions.appScopeProvider = $scope;
		$scope.administrativeReportOptions.onRegisterApi = function (gridApi) {
			$scope.gridApi = gridApi;
		};
	};
	/******************** 初始化加载页面 *******************************/
	const initController = () => {
		timePicker();
		initHolidayReportGrid();
		administrativeReportOptions();
		getReportGridData('1');
	};
	initController();
}

AutomaticGenerationReportsController.$inject = ['$scope', '$state', '$filter', 'HttpRequestService', 'CheckDateUtils'];