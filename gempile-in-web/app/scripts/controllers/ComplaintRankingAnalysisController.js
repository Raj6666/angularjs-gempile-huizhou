/**
 * Created by richstone on 2017/12/11.
 */
'use strict';

import APIS from '../configs/ApisConfig';
import Flatpickr from 'flatpickr';
const echarts = require('echarts');
import Loading from '../custom-pulgin/Loading';
import swal from 'sweetalert2';
import {NOW, ONE_HOUR_MS, ONE_DAY_MS} from '../constants/CommonConst';

/**
 * ControlPanelController
 *
 * @export
 * @param $scope
 * @param $filter
 * @param HttpRequestService
 */
export default function ComplaintRankingAnalysisController($scope, $filter, HttpRequestService) {
	/** 查询状态信息，显示在地图头部 */
	$scope.queryStatusMessage = '无';
	$scope.topNum = '';

	/** 高投诉基站和高投诉用户tab页面切换 Y*/
	$scope.pageSelect = 1;

	/**初始化时间插件*/ //此插件在渲染页面时存在闪烁的问题所以换成别的
	/*let selectTimeStr = '';//返回时间戳日期
	let selectMonthStr = '';//返回字符串日期
	$(function () {
		$('#selMonth').datebox({
			//显示日趋选择对象后再触发弹出月份层的事件，初始化时没有生成月份层
			onShowPanel: function () {
				//触发click事件弹出月份层
				span.trigger('click');
				if (!tds)
				//延时触发获取月份对象，因为上面的事件触发和对象生成有时间间隔
					setTimeout(function () {
						tds = p.find('div.calendar-menu-month-inner td');
						tds.click(function (e) {
							//禁止冒泡执行easyui给月份绑定的事件
							e.stopPropagation();
							//得到年份
							let year = /\d{4}/.exec(span.html())[0],
								//月份
								//之前是这样的month = parseInt($(this).attr('abbr'), 10) + 1;
								month = parseInt($(this).attr('abbr'), 10);
							//隐藏日期对象
							$('#selMonth').datebox('hidePanel')
							//设置日期的值
								.datebox('setValue', year + '-' + month);
						});
					}, 0);
			},
			//配置parser，返回选择的日期
			parser: function (s) {
				if (!s) return new Date();
				let arr = s.split('-');
				return new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, 1);
			},
			//配置formatter，只返回年月 之前是这样的d.getFullYear() + '-' +(d.getMonth());
			formatter: function (d) {
				let currentMonth = (d.getMonth() + 1);
				let currentMonthStr = currentMonth < 10 ? ('0' + currentMonth) : (currentMonth + '');
				selectTimeStr = new Date(d.getFullYear() + "/" + currentMonthStr).getTime();//获取的时间值，传给后端
				selectMonthStr = d.getFullYear() + '-' + currentMonthStr;
				return d.getFullYear() + '-' + currentMonthStr;
			},
		});

		//日期选择对象
		let p = $('#selMonth').datebox('panel'),
			//日期选择对象中月份
			tds = false,
			//显示月份层的触发控件
			span = p.find('span.calendar-text');
		let curr_time = new Date();
		//设置前当月
		$("#selMonth").datebox("setValue", myformatter(curr_time));
	});
	function myformatter(date) {
		//获取年份
		let y = date.getFullYear();
		//获取月份
		let m = date.getMonth() + 1;
		m = m < 10 ? ('0' + m) : m;
		return y + '-' + m;
	}*/

	/**绑定月份*/
	$scope.selectMonthStr='';

	/** 高投诉用户与高投诉基站页面切换 Y*/
	$scope.switchUserAndBaseStation = pageId => {
		if (pageId === 1 && $scope.pageSelect === 2) {
			$scope.pageSelect = 1;
			//$scope.selTab = "高投诉用户";
		}
		else if (pageId === 2 && $scope.pageSelect === 1) {
			$scope.pageSelect = 2;
			//$scope.selTab = "高投诉基站";
		}
	}

	/**ui-grid表格设计*/
	/*let cellTemplate = `
	 <div class="ngCellText ui-grid-cell-contents" style="padding:0 30px;">
	 <span>{{COL_FIELD CUSTOM_FILTERS}}</span>
	 </div>
	 `;*/
	let rowTemplate = `
    <div ng-mouseover="rowStyle={'background-color': '#D3F1FF'}; grid.appScope.onRowHover(this);" ng-mouseleave="rowStyle={}">
<div  ng-style="rowStyle" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + '-' + col.uid + '-cell'"
class="ui-grid-cell" ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader }" role="{{col.isRowHeader ? 'rowheader' : 'gridcell'}}" ui-grid-cell>
</div></div>
    `;
	const initComplaintGrid = () => {
		/***高投诉用户*/
		$scope.highComplaintUsersOptions = {
			rowTemplate,
			rowHeight: 30,
			columnDefs: [
				{name: 'monthId', displayName: "投诉月份",},
				{name: 'complainRank', displayName: "当月投诉次数排名", type: 'number'},
				{name: 'complainMsisdn', displayName: "投诉用户",},
				{name: 'complainCount', displayName: "用户当月累计投诉次数", type: 'number'},
			],
			enableSorting: true,//是否支持排序(列)
			enableColumnMenu: false,
			enableHorizontalScrollbar: 1,//表格的水平滚动条
			enableVerticalScrollbar: 1,//表格的垂直滚动条 (两个都是 1-显示,0-不显示)
			exporterCsvFilename: '高投诉用户数据表.csv',
			exporterOlderExcelCompatibility: true,
			paginationTemplate: './views/templates/ui-grid/pageControlTemplate.html',
			enablePaginationControls: true,
			paginationPageSizes: [10, 20, 30], //每页显示个数选项
			paginationCurrentPage: 1, //当前的页码
			paginationPageSize: 10, //每页显示个数
		};
		$scope.highComplaintUsersOptions.appScopeProvider = $scope;
		$scope.highComplaintUsersOptions.onRegisterApi = function (gridApi) {
			$scope.gridApi = gridApi;
		};

		/***高投诉基站*/
		$scope.highComplaintBaseStation = {
			rowTemplate,
			rowHeight: 30,
			columnDefs: [
				{name: 'monthId', displayName: "投诉月份",},
				{name: 'rank', displayName: "当月投诉基站排名", type: 'number'},
				{name: 'enodebName', displayName: "投诉基站名称",},
				{name: 'netType', displayName: "投诉网路制式",},
				{name: 'complainCustomersNum', displayName: "当月累计投诉客户数", type: 'number'},
			],
			enableSorting: true,//是否支持排序(列)
			suppressRemoveSort: true,
			enableHorizontalScrollbar: 1,//表格的水平滚动条
			enableVerticalScrollbar: 1,//表格的垂直滚动条 (两个都是 1-显示,0-不显示)
			exporterCsvFilename: '高投诉基站数据表.csv',
			exporterOlderExcelCompatibility: true,
			paginationTemplate: './views/templates/ui-grid/pageControlTemplate.html',
			enablePaginationControls: true,
			paginationCurrentPage: 1, //当前的页码
			paginationPageSize: 10, //每页显示个数
			paginationPageSizes: [10, 20, 30], //每页显示个数选项
		};
		$scope.highComplaintBaseStation.appScopeProvider = $scope;
		$scope.highComplaintBaseStation.onRegisterApi = function (gridApi) {
			$scope.gridApi = gridApi;
		};
	}

	$scope.usersExportToCsv = () => {
		if ($scope.highComplaintUsersOptions.data.length === 0) {
			swal({
				showCloseButton:true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '没有相关数据！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		let url = APIS.complaintRanking.customerExport;
		let params = {
			timeSlots:$scope.selectMonthStr.valueOf(),
			top: $scope.topNum,
			fileName:'高投诉用户数据表'
		};
		window.location = url+'?timeSlots='+params.timeSlots+'&top='+params.top+'&fileName='+params.fileName;
	}

	$scope.baseStationExportToCsv = () => {
		if ($scope.highComplaintBaseStation.data.length === 0) {
			swal({
				showCloseButton:true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '没有相关数据！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		let url = APIS.complaintRanking.baseStationExport;
		let params = {
			time:$scope.selectMonthStr.valueOf(),
			topSize: $scope.topNum,
			fileName:'高投诉基站数据表'
		};
		window.location = url+'?time='+params.time+'&topSize='+params.topSize+'&fileName='+params.fileName;
	}

	function getMonthString(date) {
		//获取年份
		let y = date.getFullYear();
		//获取月份
		let m = date.getMonth() + 1;
		m = m < 10 ? ('0' + m) : m;
		return y + '年' + m + '月';
	}

	/**点击查询*/
	$scope.toComplainRankingAnalysis = () => {
		$('.noBaseStationAnalysis').hide();
		$('.noUsersAnalysis').hide();
		//console.log(getMonthString($scope.selectMonthStr));
		if ($scope.selectMonthStr == '') {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '月份不能为空!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		if ($scope.topNum === '' || $scope.topNum == null) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择TOP值!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		$scope.queryStatusMessage = `${getMonthString($scope.selectMonthStr) + '，TOP：'}${$scope.topNum}`;
		let url1 = APIS.complaintRanking.customerComplainRankKpiList;
		let url2 = APIS.complaintRanking.baseStationList;
		Loading.isLoading('.table-box');
		HttpRequestService.get(url1, {
			timeSlots: $scope.selectMonthStr.valueOf(),
			top: $scope.topNum,
		}, response => {
			Loading.hideLoading('.table-box');
			if (response == '') {
				$('.noUsersAnalysis').show();
			}
			$scope.highComplaintUsersOptions.data.length = 0;
			$scope.highComplaintUsersOptions.paginationCurrentPage=1;
			for (let i = 0; i < response.length; i++) {
				let phone = String(response[i].complainMsisdn);
				response[i].complainMsisdn = phone.substring(0, 3) + '****' + phone.substring(7);
				response[i].monthId = getMonthString(new Date(response[i].monthId));
			}
			$scope.highComplaintUsersOptions.data = response;
		}, () => {
			Loading.hideLoading('.table-box');
			$('.noUsersAnalysis').show();
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '没有获取到高投诉用户数据，请重新查询!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
		})
		HttpRequestService.get(url2, {
			time: $scope.selectMonthStr.valueOf(),
			topSize: $scope.topNum,
		}, response => {
			if (response == '') {
				$('.noBaseStationAnalysis').show();
			}
			$scope.highComplaintBaseStation.data.length = 0;
			$scope.highComplaintBaseStation.paginationCurrentPage=1;
			for (let i = 0; i < response.length; i++) {
				response[i].monthId = getMonthString(new Date(response[i].monthId));
			}
			$scope.highComplaintBaseStation.data = response;
		}, () => {
			$('.noBaseStationAnalysis').show();
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '没有获取到高投诉基站数据，请重新查询!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
		})
	}


	/** 初始化加载Controller */
	const initController = () => {
		initComplaintGrid();
	};
	initController();
}

ComplaintRankingAnalysisController.$inject = ['$scope', '$filter', 'HttpRequestService'];

