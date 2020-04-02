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
export default function ComplaintLabelAnalysisController($scope, $filter, HttpRequestService) {
	/** 查询状态信息，显示在地图头部 */
	$scope.queryStatusMessage = '无';
	/**初始时间值*/
	let startDate;
	let endDate;
	/**点击查询之前的状态*/
	$scope.pageSelect = 1;
	$scope.selectNumberOrRate = '用户数';
	$scope.labelType = '';
	let seriesRatioData = [];
	let seriesCustomerNData = [];
	/**折线图默认的是用户数还是占比*/
	let lineType = $('#type_name option:selected').val();
	/**选择日期时段地区的默认值*/
	let timeSlots = '';

	/** 屏幕分辨率宽度 */
	let screenWidth = window.screen.width;

	/**将时间戳转换成日期的函数*/
	const dateToStr = (date, dateType) => {
		let time = new Date(date);
		let currentYear = time.getFullYear();
		let currentMonth = (time.getMonth() + 1);
		let currentMonthStr = currentMonth < 10 ? ('0' + currentMonth) : (currentMonth + '');
		let currentDay = time.getDate();
		let currentDayStr = currentDay < 10 ? ('0' + currentDay) : (currentDay + '');
		if (dateType === 1) {
			return currentYear + '-' + currentMonthStr + '-' + currentDayStr;
		}
		if (dateType === 2) {
			return currentYear + '/' + currentMonthStr + '/' + currentDayStr;
		}
	}


	/**点击查询显示数据*/
	$scope.toComplaintLabelAnalysis = () => {
		$('.noAnalysis').hide();
		$scope.labelTypeName = $('#selLabel option:selected').text();
		$scope.startDate = $('#startTimePicker').val();
		$scope.endDate = $('#endTimePicker').val();
		if ($scope.labelType === '' || $scope.labelType == null) {
			swal({
				showCloseButton:true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择标签!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		if ($scope.startDate === '') {
			swal({
				showCloseButton:true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择开始时间!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		if ($scope.endDate === '') {
			swal({
				showCloseButton:true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择结束时间!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		if(startDate>endDate){
			swal({
				showCloseButton:true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '开始日期不能大于结束日期!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		if(endDate-startDate>30 * ONE_DAY_MS){
			swal({
				showCloseButton:true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '开始日期与结束日期不能超过30天!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		$scope.queryStatusMessage = `${$scope.labelTypeName + '，'} ${$scope.startDate + ' 至  '} ${$scope.endDate}`;
		// console.log($scope.labelGridOptions.columnDefs[1].displayName);
		let columns = [
			{name: 'time', displayName: '时间'},
			{name: 'tagSubType', displayName: 'ARPU值'},
			{name: 'subscriber', displayName: '投诉用户数量',type:'number'},
			{name: 'ratio', displayName: '投诉占比'},
		];
		switch ($scope.labelType) {
			case '1':
				columns[1].displayName = 'ARPU值';
				break;
			case '2':
				columns[1].displayName = '使用主套餐';
				break;
			case '3':
				columns[1].displayName = '通话计费时长(MOU)';
				break;
			case '4':
				columns[1].displayName = '上网流量(DOU)';
				break;
			case '5':
				columns[1].displayName = '流量套餐';
				break;
			case '6':
				columns[1].displayName = '投诉次数';
				break;
			case '7':
				columns[1].displayName = '用户满意度评分';
				break;
			case '8':
				columns[1].displayName = '常用APP名称TOP10';
				break;
			case '9':
				columns[1].displayName = '区域类型';
				break;
			case '10':
				columns[1].displayName = '终端品牌';
				break;
			case '11':
				columns[1].displayName = 'TCP一、二次握手时延';
				break;
			case '12':
				columns[1].displayName = '附着失败次数';
				break;
			case '13':
				columns[1].displayName = '三次握手失败次数';
				break;
		}
		$scope.labelGridOptions.columnDefs = columns;

		/***将时间日期转换成时间戳**/
		let sDate = ($scope.startDate).replace(/-/g, '/');
		let eDate = ($scope.endDate).replace(/-/g, '/');
		//console.log(sDate,eDate)
		let date1 = new Date(sDate).getTime();
		let date2 = new Date(eDate).getTime();
		timeSlots = date1 + ',' + date2;

		/**表格接口*/
		let gridUrl = APIS.complaintLabel.kpiList;
		Loading.isLoading('.tableAnalysis');
		HttpRequestService.get(gridUrl, {
			timeSlots: timeSlots,
			tag: $scope.labelType,
		}, response => {
			Loading.hideLoading('.tableAnalysis');
			if (response == '') {
				$('.noAnalysis').show();
			}
			for (let i = 0; i < response.length; i++) {
				response[i].ratio = response[i].ratio + '%';
				response[i].time = dateToStr(response[i].time, 1);
			}
			$scope.labelGridOptions.data.length = 0;
			$scope.labelGridOptions.paginationCurrentPage=1;
			$scope.labelGridOptions.data = response;
		}, () => {
			$scope.labelGridOptions.data.length = 0;
			Loading.hideLoading('.tableAnalysis');
			$('.noAnalysis').show();
			swal({
				showCloseButton:true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '没有获取到数据，请重新查询!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
		})

		/**饼图接口*/
		let pieUrl = APIS.complaintLabel.ratios;
		Loading.isLoading('.pieAnalysis');
		HttpRequestService.get(pieUrl, {
			timeSlots: timeSlots,
			tag: $scope.labelType,
		}, response => {
			Loading.hideLoading('.pieAnalysis');
			let pieName = [];
			let pieData = [];
			for (let i = 0; i < response.length; i++) {
				pieName.push(response[i].tagSubType);
				pieData.push({value: response[i].ratio, name: response[i].tagSubType})
			}
			pieOption.legend.data = pieName;
			pieOption.series[0].data = pieData;
			pieChart.setOption(pieOption);
		}, () => {
			Loading.hideLoading('.pieAnalysis');
		})

		/**折线图接口*/
		let lineUrl = APIS.complaintLabel.daysKpiList;
		Loading.isLoading('.lineAnalysis');
		HttpRequestService.get(lineUrl, {
			timeSlots: timeSlots,
			tag: $scope.labelType,
		}, response => {
			Loading.hideLoading('.lineAnalysis');
			let legendData = [];
			//console.log(legendData)
			let xAxisData = [];
			seriesRatioData = [];
			seriesCustomerNData = [];
			lineOption.series = [];
			//console.log(seriesRatioData, seriesCustomerNData);
			/**遍历出键名，得到legend值*/
			for (let item in response) {
				legendData.push(item);
			}
			if (legendData.length === 0) {
				lineChart.clear();
				return;
			}
			/**遍历得出X轴的名称（日期）*/
			response[legendData[0]].map(record => {
				xAxisData.push(dateToStr(record.time, 2));
			});
			/**两个循环得到用户数和占比的数据*/
			/**第一次循环*/
			legendData.map(item => {
				let ratioSeries = {
					name: '',
					type: 'line',
					data: [],
				}
				let customerSeries = {
					name: '',
					type: 'line',
					data: [],
				}
				/**第二次循环*/
				response[item].map(record => {
					ratioSeries.name = item;
					customerSeries.name = item;
					ratioSeries.data.push(record.ratio/100);
					customerSeries.data.push(record.complainCustomerNum);
				});
				seriesRatioData.push(ratioSeries);
				seriesCustomerNData.push(customerSeries);
			});
			//console.log(seriesRatioData);
			//console.log(seriesCustomerNData);

			lineOption.legend.data = legendData;
			lineOption.xAxis[0].data = xAxisData;
			if (lineType === '用户数') {
				lineOption.series = seriesCustomerNData;
			} else if (lineType === '占比') {
				lineOption.series = seriesRatioData;
			}
			lineChart.clear();
			lineChart.setOption(lineOption);
		}, () => {
			Loading.hideLoading('.lineAnalysis');
			lineChart.clear();
		})
	}

	/**初始化时间控件*/
	const initDatePicker = () => {
		let startDatePicker;
		let endDatePicker;
		let startPickerConfig = {
			//defaultDate: startDate,
			onChange(selectedDates) {
				let selectedDateTime = selectedDates[0].getTime();
				startDate = selectedDateTime;
				//endDate = startDate;
				if (endDatePicker) {
					//endDatePicker.config.minDate = startDate;
					endDatePicker.set('enable', [date => date.getTime() - selectedDateTime <= 29 * ONE_DAY_MS && ((date.getTime() - selectedDateTime <= 0 && date.getTime() - selectedDateTime > -ONE_DAY_MS) || date.getTime() - selectedDateTime > 0)]);
				}
				if(startDate>endDate){
					swal({
						html: '<div style="font-size:30px;font-weight:700;line-height:20px;margin-bottom:15px;color:rgba(0,0,0,.8)">操作提示</div><div style="font-size:20px;">开始时间不能大于结束时间</div>',
						timer: 2000,
						showConfirmButton: false,
						allowOutsideClick: false,
						allowEscapeKey: false,
					})
					$('.swal2-modal .swal2-title').hide();
					$('#endTimePicker').css('color','red');
				}else{
					$('#endTimePicker').css('color','#464a4c');
				}
				if(endDate-startDate>30 * ONE_DAY_MS){
					swal({
						html: '<div style="font-size:30px;font-weight:700;line-height:20px;margin-bottom:15px;color:rgba(0,0,0,.8)">操作提示</div><div style="font-size:20px;">开始时间与结束时间不能大于30天</div>',
						timer: 2000,
						showConfirmButton: false,
						allowOutsideClick: false,
						allowEscapeKey: false,
					})
					$('.swal2-modal .swal2-title').hide();
					$('#endTimePicker').css('color','red');
				}
			},
		};
		let endPickerConfig = {
			//defaultDate: endDate,
			minDate: 0,//startDate
			maxDate: NOW,
			onChange(selectedDates) {
				let selectedDateTime = selectedDates[0].getTime();
				endDate = selectedDateTime;  // 获取结束日期
				if(startDate<=endDate){
					$('#endTimePicker').css('color','#464a4c');
				}
				/*if (startDatePicker) {
					//startDatePicker.config.maxDate = endDate;
					startDatePicker.set('enable', [date => selectedDateTime - date.getTime() <= 30 * ONE_DAY_MS && selectedDateTime - date.getTime() >= 0]);
				}*/
			},
		};
		$(document).ready(() => {
			startDatePicker = new Flatpickr(document.getElementById('startTimePicker'), startPickerConfig);
			endDatePicker = new Flatpickr(document.getElementById('endTimePicker'), endPickerConfig);
		})
	};

	/*const testDatePicker = () => {
	 let startDatePicker;
	 let testConfig = {
	 inline: true,
	 mode: 'multiple',
	 enable: ["2017-12-30", "2017-12-21", "2017-12-08", new Date(2017, 12, 9)],
	 defaultDate: ["2017-12-30", "2017-12-21", "2017-12-08", new Date(2017, 12, 9)],
	 };
	 $(document).ready(() => {
	 startDatePicker = new Flatpickr(document.getElementById('test'), testConfig);
	 })
	 };*/
	//testDatePicker();

	/**初始化投诉标签分析表*/
	let rowTemplate = `
    <div ng-mouseover="rowStyle={'background-color': '#D3F1FF'}; grid.appScope.onRowHover(this);" ng-mouseleave="rowStyle={}">
    <div  ng-style="rowStyle" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + '-' + col.uid + '-cell'"
    class="ui-grid-cell" ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader }" role="{{col.isRowHeader ? 'rowheader' : 'gridcell'}}" ui-grid-cell>
    </div></div>
    `;
	const initLabelGrid = () => {
		$scope.labelGridOptions = {
			rowTemplate,
			rowHeight: 30,
			columnDefs: [
				{name: 'time', displayName: '时间'},
				{name: 'tagSubType', displayName: 'ARPU值'},
				{name: 'subscriber', displayName: '投诉用户数量'},
				{name: 'ratio', displayName: '投诉占比'},
			],
			enableSorting: true, //是否排序
			enableVerticalScrollbar: 1,
			enablePaginationControls: true,
			//exporterCsvFilename: '投诉标签分析数据表.csv',
			//exporterOlderExcelCompatibility: true,
			paginationCurrentPage:1, //当前的页码
			paginationPageSize: 10,
			paginationPageSizes: [10, 20, 30],
			paginationTemplate: './views/templates/ui-grid/pageControlTemplate.html',
		};
		$scope.labelGridOptions.appScopeProvider = $scope;
		$scope.labelGridOptions.onRegisterApi = function (gridApi) {
			$scope.gridApi = gridApi;
		}

		/**表格适配不同的分辨率*/
		const adaptDifferentWidth = () => {
			let innerWidth = window.innerWidth;
			/**适配不同的屏幕宽度*/
			if (innerWidth < 1367) {
				$scope.labelGridOptions.rowHeight = 24;
			} else if (innerWidth < 1681) {
				$scope.labelGridOptions.rowHeight = 27;
			} else if (innerWidth >= 1681) {
				$scope.labelGridOptions.rowHeight = 30;
			}
		}
		adaptDifferentWidth();
		$(window).resize(() => {
			adaptDifferentWidth();
		});
	}

	/***触发导出全部数据*/
	$scope.exportToCsv = () => {
		if ($scope.labelGridOptions.data.length === 0) {
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
		let url = APIS.complaintLabel.exportKpiList;
		let params = {
			timeSlots:timeSlots,
			tag: $scope.labelType,
			fileName:'投诉标签分析数据表'
		};
		window.location = url+'?timeSlots='+params.timeSlots+'&tag='+params.tag+'&fileName='+params.fileName;
	};

	/**初始化饼图*/
	let pieChart = echarts.init(document.getElementById('pieChart'));
	let pieOption = {};
	const getPieChart = () => {
		pieOption = {
			tooltip: {
				trigger: 'item',
				formatter: '{a}<br/>{b} : {c}%',
			},
			legend: {
				orient: 'horizontal',
				bottom: 10,
				width: '90%',
				itemGap: 10,
				itemWidth: 10,
				itemHeight: 10,
				data: '',
				//['30元以下', '30元或以上，60元以下', '60元或以上，80元以下', '80元或以上，120元以下', '120元或以上']
			},
			series: [
				{
					name: '占比',
					type: 'pie',
					radius: '65%',
					center: ['50%', '40%'],
					hoverAnimation: false,
					hoverOffset: 0,//高亮扇区的偏移距离
					labelLine: {
						normal: {
							show: true,
							length:10,
							length2:10,
						},
					},
					label: {
						normal: {
							show: true,
							position: 'outside',
							offset: [100, 100],
							formatter: '{c}%',
						},
					},
					itemStyle: {
						normal: {
							color: function (params) {
								// build a color map as your need.
								let colorList = [
									'#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a',
									'#6e7074', '#546570', '#c4ccd3', '#50287d', '#fe452c', '#B47CE6',
								];
								return colorList[params.dataIndex]
							},
						},
						emphasis: {
							shadowBlur: 5,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)',
						},
					},
					data: [],
					/*{value: 15, name: '30元以下'},
					 {value: 20, name: '30元或以上，60元以下'},
					 {value: 25, name: '60元或以上，80元以下'},
					 {value: 25, name: '80元或以上，120元以下'},
					 {value: 15, name: '120元或以上'},*/
				},
			],
		}
		/**适配不同的屏幕宽度*/
		/*switch (screenWidth) {
		 case 1366:
		 pieOption.legend.bottom = 2;
		 pieOption.legend.width = '98%';
		 pieOption.legend.itemGap = 5;
		 pieOption.series[0].radius = '64%';
		 pieOption.series[0].center = ['50%', '36%'];
		 break;
		 case 1440:
		 case 1400:
		 case 1600:
		 pieOption.legend.bottom = 5;
		 pieOption.legend.width = '98%';
		 pieOption.legend.itemGap = 7;
		 pieOption.series[0].center = ['50%', '38%'];
		 break;
		 default:
		 break;
		 }
		 pieChart.setOption(pieOption);*/
		resizePieChart();
	}

	/**饼图适配不同的屏幕宽度*/
	const resizePieChart = () => {
		let innerWidth = window.innerWidth;
		if (innerWidth <= 1366) {
			pieOption.legend.bottom = 2;
			pieOption.legend.width = '98%';
			pieOption.legend.itemGap = 5;
			pieOption.series[0].radius = '58%';
			pieOption.series[0].center = ['50%', '35%'];
		} else if (innerWidth <= 1680) {
			pieOption.legend.bottom = 5;
			pieOption.legend.width = '98%';
			pieOption.legend.itemGap = 7;
			pieOption.series[0].radius = '65%';
			pieOption.series[0].center = ['50%', '38%'];
		} else {
			pieOption.legend.bottom = 10;
			pieOption.legend.width = '98%';
			pieOption.legend.itemGap = 10;
			pieOption.series[0].radius = '66%';
			pieOption.series[0].center = ['50%', '40%'];
		}
		pieChart.setOption(pieOption);
	}

	/**初始化折线图*/
	let lineChart = echarts.init(document.getElementById('lineChart'));
	let lineOption = {};
	let lineLegendWidth = $('#lineChart').width() - 145;
	const getLineChart = () => {
		lineOption = {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					label: {
						backgroundColor: '#6a7985',
					},
				},
				formatter: function (params) {
					let toolStr = params[0].axisValueLabel;
					if (lineType === '用户数') {
						params.map(param => {
							toolStr += '<br>' + param.marker + param.seriesName + ' : ' + param.value + '人';
						});
						return toolStr;
					} else if (lineType === '占比') {
						params.map(param => {
							toolStr += '<br>' + param.marker + param.seriesName + ' : ' + (param.value*100) + '%';
						});
						return toolStr;
					}
				},
			},
			legend: {
				left: 30,
				padding: [8, 135, 0, 0],
				width: lineLegendWidth,
				itemGap: 6,//图例每项之间的间隔
				itemHeight: 10,
				data: [],
			},
			/*toolbox: {
			 feature: {
			 saveAsImage: {}
			 }
			 },*/
			grid: {
				left: '1.5%',
				right: '1.5%',
				bottom: '3%',
				containLabel: true,
			},
			xAxis: [
				{
					axisLine: {
						show: true,
					},
					axisTick: {
						show: false,
					},
					type: 'category',
					//boundaryGap : false, 坐标是否在中间
					data: [],
					// data: ['2017/11/23', '2017/11/24', '2017/11/25', '2017/11/26', '2017/11/27', '2017/11/28', '2017/11/29'],
				},
			],
			yAxis: [
				{
					axisLine: {
						show: true,
					},
					axisTick: {
						show: false,
					},
					type: 'value',
				},
			],
			series: [
				// {
				// 	name: '30元以下',
				// 	type: 'line',
				// 	stack: '总量',
				// 	//areaStyle: {normal: {}},
				// 	data: [120, 132, 101, 134, 90, 230, 210],
				// },
				// {
				// 	name: '30元或以上，60元以下',
				// 	type: 'line',
				// 	stack: '总量',
				// 	//areaStyle: {normal: {}},
				// 	data: [220, 182, 191, 234, 290, 330, 310],
				// },
				// {
				// 	name: '60元或以上，80元以下',
				// 	type: 'line',
				// 	stack: '总量',
				// 	//areaStyle: {normal: {}},
				// 	data: [150, 232, 201, 154, 190, 330, 410],
				// },
				// {
				// 	name: '80元或以上，120元以下',
				// 	type: 'line',
				// 	stack: '总量',
				// 	//areaStyle: {normal: {}},
				// 	data: [320, 332, 301, 334, 390, 330, 320],
				// },
				// {
				// 	name: '120元或以上',
				// 	type: 'line',
				// 	stack: '总量',
				// 	/*label: {
				// 	 normal: {
				// 	 show: true,
				// 	 position: 'top'
				// 	 }
				// 	 },*/
				// 	//areaStyle: {normal: {}},显示面积图
				// 	data: [820, 932, 901, 934, 1290, 1330, 1320],
				// },
			],
			color: ['#E63638', '#07B4F6', '#FE8C10', '#FEC832', '#F9009C', '#7C58EC', '#cdec1e', '#9DCFEC', '#B17CEC', '#22ec17',
				'#e6706c', '#62d5f6', '#feb64b', '#feef24', '#f988ca', '#a693ec', '#b8ec6e', '#8ce9ec', '#d6b6ec', '#c8ec82'],
		};
		lineChart.setOption(lineOption);
	}
	/**切换用户数和占比*/
	$(document).ready(function () {
		$("#type_name").change(function () {
			lineType = $('#type_name option:selected').val();
			$("#type_name option[value='" + $('#type_name option:selected').val() + "']").prop("selected", true);
			if (lineType === '用户数') {
				lineOption.series = seriesCustomerNData;
			} else if (lineType === '占比') {
				lineOption.series = seriesRatioData;
			}
			lineChart.setOption(lineOption);
		});
	});

	/**屏幕自适应 ——浏览器大小改变时重置图表宽高*/
	$(window).resize(() => {
		resizePieChart();
		lineLegendWidth = $('#lineChart').width() - 145;
		lineOption.legend.width = lineLegendWidth;
		lineChart.setOption(lineOption);
		let chart1 = echarts.getInstanceByDom(document.getElementById('pieChart'));
		let chart2 = echarts.getInstanceByDom(document.getElementById('lineChart'));
		chart1.resize();
		chart2.resize();
	});


	/** 初始化加载Controller */
	const initController = () => {
		initDatePicker();//初始化时间
		initLabelGrid();//初始化表格
		getPieChart();
		getLineChart();
	};
	initController();
}

ComplaintLabelAnalysisController.$inject = ['$scope', '$filter', 'HttpRequestService'];
