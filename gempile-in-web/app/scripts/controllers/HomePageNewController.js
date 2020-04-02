/* eslint-disable func-style,prefer-arrow-callback */
'use strict';

const echarts = require('echarts');
import APIS from '../configs/ApisConfig';
import { NOW, ONE_HOUR_MS } from '../constants/CommonConst';

/**
 * ControlPanelController
 *
 * @export
 * @param $scope
 * @param $filter
 * @param HttpRequestService
 */
export default function HomePageNewController($scope, $filter, $rootScope, HttpRequestService) {
	/** 统计时间，每过一个小时更新，显示当天数据 */
	//const analysisTime = NOW - ((NOW + (ONE_HOUR_MS * 8) - (ONE_HOUR_MS * 5)) % ONE_DAY_MS) - ONE_DAY_MS - (ONE_HOUR_MS * 5);
	//$scope.currentDayTime = $filter('date')(analysisTime, 'yyyy-MM-dd');
	$scope.currentDayTime = $filter('date')(NOW - (ONE_HOUR_MS * 24), 'yyyy/MM/dd');
	//$scope.currentStatisticalTime = '' + $scope.currentDayTime;
	/** 用于隐藏头部导航栏的全局变量 */
	//$rootScope.showTopNavigator = true;
	/** 初始化时间粒度 */
	$scope.refreshTime = 60;
	/** 切换考核指标与Volte指标页码 */
	$scope.pageSelect = 1;
	/** 显示网元图表的页码 */
	$scope.networkChartPageNumber = 1;
	/** 惠州在线用户总人数&总流量 */
	$scope.totalFlow = 0;
	$scope.totalUsercount = 0;
	$scope.total4GFlow = 0;
	$scope.total2and3GFlow = 0;
	/** 鼠标是否进入考核指标与volte指标模块 */
	$scope.isEnterIndicator = false;
	/** 鼠标是否进入网元速率模块 */
	$scope.isEnterNetElement = false;
	/** 鼠标是否进入网络概述表格 */
	$scope.isEnterTable = false;
	/** 屏幕分辨率宽度 */
	let screenWidth = window.screen.width;
	/** 浏览器的宽度 */
	let browserWidth = $(document).width();
	/** 浏览器是否初始化 */
	let browserIsInitialize = true;
	/** 鼠标与浏览器顶部的距离 */
	let scrollTop = 0;
	/** 控件轮播计时器*/
	let timer;

	/**默认按流量排序，1代表用户数，2代表流量*/
	let twoBarRank = 2;
	/**双向柱形图页码*/
	$scope.pageNum = 1;
	let pageCount = 0;

	/**设置map的高度,因为老版本的谷歌中午饭获取到地图的高度，所有需要先赋值*/
	let htmlSize = parseInt(getComputedStyle(window.document.documentElement)['font-size']);
	$('#huizhouMap').height($('.middle').height() - htmlSize * 12.3 - 30);

	/**获取城市id*/
	let cityId = localStorage.getItem('cityId');
	if (cityId == 860752) {
		$scope.logingOfCity = 'huizhou';
	} else if (cityId == 860768) {
		$scope.logingOfCity = 'chaozhou';
	} else if (cityId == 860751) {
		$scope.logingOfCity = 'shaoguan';
	} else if (cityId == 860760) {
		$scope.logingOfCity = 'zhongshan';
	} else if (cityId == 860756) {
		$scope.logingOfCity = 'zhuhai';
	} else if (cityId == 860668) {
		$scope.logingOfCity = 'maoming';
	}

	/*$scope.networkChartPage3=false;
	 $scope.networkChartPage4=false;*/
	/**根据地市判断生成几个网元柱形图*/
	if ($scope.logingOfCity == 'huizhou') {
		$scope.networkChartPage3 = false;
		$scope.networkChartPage4 = false;
	} else if ($scope.logingOfCity == 'chaozhou') {
		$scope.networkChartPage3 = false;
		$scope.networkChartPage4 = false;
	} else if ($scope.logingOfCity == 'shaoguan') {
		$scope.networkChartPage3 = true;
		$scope.networkChartPage4 = true;
	} else if ($scope.logingOfCity == 'zhongshan') {
		$scope.networkChartPage3 = true;
		$scope.networkChartPage4 = false;
	} else if ($scope.logingOfCity == 'zhuhai') {
		$scope.networkChartPage3 = true;
		$scope.networkChartPage4 = false;
	} else if ($scope.logingOfCity == 'maoming') {
		$scope.networkChartPage3 = true;
		$scope.networkChartPage4 = false;
	}


	/** 获取时间戳 */
	//获取从现在到 beforetime 小时前的时间（beforetime 只能是整数）
	function beforeNowtime(beforetime) {
		let date = new Date(); //日期对象
		date.setHours(date.getHours() - beforetime);
		date.setMinutes(0);
		date.setSeconds(0);
		return date.valueOf();
	}

	function beforeNowDate() {
		let date = new Date();
		date.setDate(date.getDate() - 1);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		return date.valueOf();
		//return 1525795200000;
	}

	/** 图表请求数据函数 */
	const homeCharts = {
		/** 4G指标表 */
		getAssessment: (isInitialize, loadingStyle) => {
			let url = APIS.index.volteAndAssessmentIndicators;
			let param = {
				timeSlot: beforeNowDate(),
				cityOid: cityId
			};
			/**上半部饼图部分*/
			let chart1 = echarts.getInstanceByDom(document.getElementById('apChart1'));
			let chart2 = echarts.getInstanceByDom(document.getElementById('apChart2'));
			let chart3 = echarts.getInstanceByDom(document.getElementById('apChart3'));
			let chart4 = echarts.getInstanceByDom(document.getElementById('apChart4'));
			if (isInitialize) {
				chart1.showLoading(loadingStyle);
				chart2.showLoading(loadingStyle);
				chart3.showLoading(loadingStyle);
				chart4.showLoading(loadingStyle);
			}
			HttpRequestService.get(url, param, data => {
				//console.log(data);
				/**饼图1——页面显示时长 */
				let EChartsOption1 = {
					tooltip: {
						trigger: 'item',
						formatter: '{b} :<br/> {c}s',
						position: [15, 15],
					},
					legend: {
						orient: 'horizontal',
						bottom: 'bottom',
						data: ['页面显示时长'],
						selectedMode: false, //图例禁止点击
						// formatter: function(name){
						//     return name.length>4?name.substr(0,4)+"...":name;
						// },
						itemWidth: 0,
						itemHeight: 0,
						textStyle: {
							color: '#707070',
							fontStyle: 'normal',
							fontWeight: 'normal',
							fontFamily: 'sans-serif',
							fontSize: 11,
						},
					},
					series: [{
						name: '页面显示时长',
						type: 'pie',
						radius: ['60%', '75%'],
						label: {
							normal: {
								position: 'center',
							},
						},
						data: [{
							value: data.assessmentIndicators.webPageDisplayDuration,
							name: '页面显示时长(s)',
							label: {
								normal: {
									formatter: '{c}' + '\n' + 's',
									textStyle: {
										fontSize: 15,
										fontWeight: 'bolder',
										color: '#555',
									},
								},
							},
							itemStyle: {
								normal: {
									color: '#3399FF',
								},
							},
						},
							// {
							//     value: 18,
							//     name: '',
							//     label: {
							//         normal: {
							//             formatter: '',
							//             textStyle: {
							//                 color: '#555',
							//                 fontSize: 8
							//             }
							//         }
							//     },
							//     tooltip: {
							//         show: false
							//     },
							//     itemStyle: {
							//         normal: {
							//             color: '#FFB43C'
							//         },
							//         emphasis: {
							//             color: '#FFB43C'
							//         }
							//     },
							//     hoverAnimation: false
							// }
						],
					}],
				};
				/**饼图2——页面显示时长5s以上占比 */
				let EChartsOption2 = {
					tooltip: {
						trigger: 'item',
						formatter: '{b}(%) :<br/> {c}%',
						position: [15, 15],
					},
					legend: {
						orient: 'horizontal',
						top: 'top',
						data: ['页面显示时长5s以上占比'],
						selectedMode: false, //图例禁止点击
						/*eslint object-shorthand: [2, "consistent"]*/
						/*eslint-env es6*/
						formatter: function (name) {
							return name.length > 6 ? name.substr(0, 6) + '\n' + name.substr(6, 11) : name;
						},
						itemWidth: 0,
						itemHeight: 0,
						textStyle: {
							color: '#707070',
							fontStyle: 'normal',
							fontWeight: 'normal',
							fontFamily: 'sans-serif',
							fontSize: 11,
						},
					},
					series: [{
						name: '页面显示时长5s以上占比',
						type: 'pie',
						radius: ['60%', '75%'],
						label: {
							normal: {
								position: 'center',
							},
						},
						data: [{
							value: data.assessmentIndicators.webPageDisplayDurationLongerThan5sProportion,
							name: '页面显示时长5s以上占比',
							label: {
								normal: {
									formatter: '{d}',
									textStyle: {
										fontSize: 15,
										fontWeight: 'bolder',
										color: '#555',
									},
								},
							},
							itemStyle: {
								normal: {
									color: '#3399FF',
								},
							},
						},
						{
							value: 100 - data.assessmentIndicators.webPageDisplayDurationLongerThan5sProportion,
							name: '',
							label: {
								normal: {
									formatter: '%',
									textStyle: {
										fontSize: 15,
										fontWeight: 'bolder',
										color: '#555',
									},
								},
							},
							tooltip: {
								show: false,
							},
							itemStyle: {
								normal: {
									color: '#FFB43C',
								},
								emphasis: {
									color: '#FFB43C',
								},
							},
							hoverAnimation: false,
						},
						],
					}],
				};
				/**饼图3——应用商店500kbps以下占比*/
				let EChartsOption3 = {
					tooltip: {
						trigger: 'item',
						formatter: '{b}(%) :<br/> {c}%',
						position: [-165, 15],
					},
					legend: {
						orient: 'horizontal',
						top: 'top',
						data: ['应用商店500kbps以下占比'],
						selectedMode: false, //图例禁止点击
						formatter: function (name) {
							return name.length > 7 ? name.substr(0, 7) + '\n' + name.substr(7, 15) : name;
						},
						itemWidth: 0,
						itemHeight: 0,
						textStyle: {
							color: '#707070',
							fontStyle: 'normal',
							fontWeight: 'normal',
							fontFamily: 'sans-serif',
							fontSize: 11,
						},
					},
					series: [{
						name: '应用商店500kbps以下占比',
						type: 'pie',
						radius: ['60%', '75%'],
						label: {
							normal: {
								position: 'center',
							},
						},
						data: [{
							value: data.assessmentIndicators.appStore500kbBelowProportion,
							name: '应用商店500kbps以下占比',
							label: {
								normal: {
									formatter: '{d}',
									textStyle: {
										fontSize: 15,
										fontWeight: 'bolder',
										color: '#555',
									},
								},
							},
							itemStyle: {
								normal: {
									color: '#3399FF',
								},
							},
						},
						{
							value: 100 - data.assessmentIndicators.appStore500kbBelowProportion,
							name: '',
							label: {
								normal: {
									formatter: '%',
									textStyle: {
										fontSize: 15,
										fontWeight: 'bolder',
										color: '#555',
									},
								},
							},
							tooltip: {
								show: false,
							},
							itemStyle: {
								normal: {
									color: '#FFB43C',
								},
								emphasis: {
									color: '#FFB43C',
								},
							},
							hoverAnimation: false,
						},
						],
					}],
				};
				/**饼图4——页面显示成功率*/
				let EChartsOption4 = {
					tooltip: {
						trigger: 'item',
						formatter: '{b}(%) :<br/> {c}%',
						position: [-50, 15],
					},
					legend: {
						orient: 'horizontal',
						bottom: '-2',
						data: ['页面显示成功率'],
						selectedMode: false, //图例禁止点击
						formatter: function (name) {
							return name.length > 4 ? name.substr(0, 4) + '\n' + name.substr(4, 6) : name;
						},
						itemWidth: 0,
						itemHeight: 0,
						textStyle: {
							color: '#707070',
							fontStyle: 'normal',
							fontWeight: 'normal',
							fontFamily: 'sans-serif',
							fontSize: 11,
						},
					},
					series: [{
						name: '页面显示成功率',
						type: 'pie',
						radius: ['60%', '75%'],
						label: {
							normal: {
								position: 'center',
							},
						},
						data: [{
							value: data.assessmentIndicators.webPageDisplaySuccessRate,
							name: '页面显示成功率',
							label: {
								normal: {
									formatter: '{d}',
									textStyle: {
										fontSize: 15,
										fontWeight: 'bolder',
										color: '#555',
									},
								},
							},
							itemStyle: {
								normal: {
									color: '#3399FF',
								},
							},
						},
						{
							value: 100 - data.assessmentIndicators.webPageDisplaySuccessRate,
							name: '',
							label: {
								normal: {
									formatter: '%',
									textStyle: {
										fontSize: 15,
										fontWeight: 'bolder',
										color: '#555',
									},
								},
							},
							tooltip: {
								show: false,
							},
							itemStyle: {
								normal: {
									color: '#FFB43C',
								},
								emphasis: {
									color: '#FFB43C',
								},
							},
							hoverAnimation: false,
						},
						],
					}],
				};
				/**HTTP下载速率*/
				$scope.httpDlRate = data.assessmentIndicators.httpDlRate;
				/**浏览时延与成功率*/
				$scope.browseResponseDelay = data.assessmentIndicators.browseAppResponseDelay;
				$scope.browseResponseSuccessRate = data.assessmentIndicators.browseAppSuccessRate;
				let browseProgress = $('#pChart5');
				browseProgress.find('.leftBar').css('width', data.assessmentIndicators.browseAppSuccessRate + '%');
				browseProgress.find('.rightBar').css('width', 100 - data.assessmentIndicators.browseAppSuccessRate + '%');
				/**游戏时延与成功率*/
				$scope.gemResponseDelay = data.assessmentIndicators.gameResponseDelay;
				$scope.gameResponseSuccessRate = data.assessmentIndicators.gameResponseSuccessRate;
				let gameProgress = $('#pChart2');
				gameProgress.find('.leftBar').css('width', data.assessmentIndicators.gameResponseSuccessRate + '%');
				gameProgress.find('.rightBar').css('width', 100 - data.assessmentIndicators.gameResponseSuccessRate + '%');
				/**视频时延与成功率*/
				$scope.videoResponseDelay = data.assessmentIndicators.videoResponseDelay;
				$scope.videoResponseSuccessRate = data.assessmentIndicators.videoResponseSuccessRate;
				let videoProgress = $('#pChart3');
				videoProgress.find('.leftBar').css('width', data.assessmentIndicators.videoResponseSuccessRate + '%');
				videoProgress.find('.rightBar').css('width', 100 - data.assessmentIndicators.videoResponseSuccessRate + '%');
				/**即时通信时延与成功率*/
				$scope.instantMessagingResponseDelay = data.assessmentIndicators.instantMessagingResponseDelay;
				$scope.instantMessagingResponseSuccessRate = data.assessmentIndicators.instantMessagingResponseSuccessRate;
				let chatProgress = $('#pChart4');
				chatProgress.find('.leftBar').css('width', data.assessmentIndicators.instantMessagingResponseSuccessRate + '%');
				chatProgress.find('.rightBar').css('width', 100 - data.assessmentIndicators.instantMessagingResponseSuccessRate + '%');
				if (screenWidth === 1400) {
					EChartsOption1.series[0].radius = ['70%', '85%'];
					EChartsOption2.series[0].radius = ['70%', '85%'];
					EChartsOption3.series[0].radius = ['70%', '85%'];
					EChartsOption4.series[0].radius = ['70%', '85%'];
				}
				chart1.setOption(EChartsOption1);
				chart2.setOption(EChartsOption2);
				chart3.setOption(EChartsOption3);
				chart4.setOption(EChartsOption4);

				if (isInitialize) {
					chart1.hideLoading();
					chart2.hideLoading();
					chart3.hideLoading();
					chart4.hideLoading();
				}
			}, () => {
				if (isInitialize) {
					chart1.hideLoading();
					chart2.hideLoading();
					chart3.hideLoading();
					chart4.hideLoading();
				}
			});
		},
		/** Volte考核表 */
		getVolte: (isInitialize, loadingStyle) => {
			let url = APIS.index.volteAndAssessmentIndicators;
			let param = {
				timeSlot: beforeNowDate(),
				cityOid: cityId
			};
			/**上半部横向柱形图部分*/
			let chart1 = echarts.getInstanceByDom(document.getElementById('callChart'));
			let chart2 = echarts.getInstanceByDom(document.getElementById('regChart'));
			/**下半部仪表图部分-*/
			let chart3 = echarts.getInstanceByDom(document.getElementById('IMSChart'));
			let chart4 = echarts.getInstanceByDom(document.getElementById('firstCallLastChart'));
			let chart5 = echarts.getInstanceByDom(document.getElementById('firstCallSuccessChart'));
			if (isInitialize) {
				chart1.showLoading(loadingStyle);
				chart2.showLoading(loadingStyle);
				chart3.showLoading(loadingStyle);
				chart4.showLoading(loadingStyle);
				chart5.showLoading(loadingStyle);
			}
			HttpRequestService.get(url, param, data => {
				let errorCode1 = [];
				let errorCode2 = [];
				let quantity1 = [];
				let quantity2 = [];
				let proportionData1 = [];
				let proportionData2 = [];
				for (let i = 0; i < data.volteIndicators.topTenCallErrorCode.length; i++) {
					proportionData1.push(data.volteIndicators.topTenCallErrorCode[i].proportion);
					proportionData2.push(data.volteIndicators.topTenRegisterErrorCode[i].proportion);
					errorCode1.push(data.volteIndicators.topTenCallErrorCode[i].errorCode);
					errorCode2.push(data.volteIndicators.topTenRegisterErrorCode[i].errorCode);
					quantity1.push(data.volteIndicators.topTenCallErrorCode[i].quantity);
					quantity2.push(data.volteIndicators.topTenRegisterErrorCode[i].quantity);
				}
				/**横向柱形图1——呼叫*/
				//let percentageData1 = ['20%', '16.3%', '16%', '13.2%', '12.8%', '9.8%', '7.6%', '5.3%', '2.7%', '1.1%'];
				let EChartsOption1 = {
					backgroundColor: '#ffffff',
					title: {
						text: '呼叫',
						x: 'center',
						top: '2%',
						textStyle: {
							color: '#000000',
							fontFamily: '微软雅黑',
							fontSize: 11,
						},
					},
					tooltip: {
						formatter: '{a}错误码: {b}<br/>{c}次',
						position: ['30%', '30%'],
					},
					grid: {
						left: '25%',
						right: '1%',
						top: '8%',
						height: 180, //设置grid高度
						containLabel: true,
					},
					xAxis: [{
						type: 'value',
						inverse: true,
						axisLabel: {
							show: false,
						},
						axisTick: {
							show: false,
						},
						axisLine: {
							show: false,
						},
						splitLine: {
							show: false,
						},
					}],
					yAxis: [{
						type: 'category',
						inverse: true,
						position: 'right',
						axisLine: {
							show: false,
						},
						axisTick: {
							show: false,
						},
						axisLabel: {
							show: true,
							margin: 3,
							interval: 0,
							textStyle: {
								color: '#000000',
								fontSize: 10,
								fontFamily: '微软雅黑',
							},
						},
						data: errorCode1,
					}],
					series: [{
						type: 'bar',
						name: '呼叫',
						barWidth: '50%',
						label: {
							normal: {
								show: true,
								position: 'left',
								offset: [5, -1],
								textStyle: {
									color: '#000000',
									fontSize: 9,
								},
								formatter: function (params) {
									return proportionData1[params.dataIndex] + '%';
								},
							},
						},
						itemStyle: {
							normal: {
								color: '#FD0100',
								barBorderRadius: [18, 0, 0, 18],

							},
						},
						data: quantity1,
					}],
				};
				/**横向柱形图2——注册*/
				//let percentageData2 = ['20%', '16.3%', '16%', '13.2%', '12.8%', '9.8%', '7.6%', '3.3%', '2.7%', '2.2%'];
				let EChartsOption2 = {
					backgroundColor: '#ffffff',
					title: {
						text: '注册',
						x: 'center',
						top: '2%',
						textStyle: {
							color: '#000000',
							fontFamily: 'sans-serif',
							fontSize: 11,
						},
					},
					tooltip: {
						formatter: '{a}错误码: {b}<br/>{c}次',
						position: ['0', '30%'],
					},
					grid: {
						left: '1.8%',
						right: '25%',
						top: '8%',
						height: 180, //设置grid高度
						containLabel: true,
					},
					xAxis: [{
						type: 'value',
						axisLabel: {
							show: false,
						},
						axisTick: {
							show: false,
						},
						axisLine: {
							show: false,
						},
						splitLine: {
							show: false,
						},
					}],
					yAxis: [{
						type: 'category',
						inverse: true,
						position: 'left',
						axisLine: {
							show: false,
						},
						axisTick: {
							show: false,
						},
						axisLabel: {
							show: true,
							margin: 3,
							textStyle: {
								color: '#000000',
								fontSize: 10,
							},
						},
						data: errorCode2,
					}],
					series: [{
						type: 'bar',
						name: '注册',
						barWidth: '50%',
						label: {
							normal: {
								show: true,
								position: 'right',
								offset: [-5, -1],
								interval: 0,
								textStyle: {
									color: '#000000',
									fontSize: 9,
								},
								formatter: function (params) {
									return proportionData2[params.dataIndex] + '%';
								},
							},
						},
						itemStyle: {
							normal: {
								color: '#03A0E7',
								barBorderRadius: [0, 18, 18, 0],

							},
						},
						data: quantity2,
					}],
				};
				/**仪表图1——IMS注册成功率*/
				let EChartsOption3 = {
					title: {
						text: 'IMS注册成功率',
						x: 'center',
						bottom: 'bottom',
						textStyle: {
							color: '#000000',
							fontFamily: '微软雅黑',
							fontWeight: 'normal',
							fontSize: 11,
						},
					},
					tooltip: {
						formatter: '{a}:<br/> {c}%',
						position: ['50%', '30%'],
					},
					axisLabel: {
						fontSize: '10',
						show: false,
					},
					series: [{
						name: 'IMS注册成功率',
						type: 'gauge',
						radius: '98%',
						min: 0,
						max: 100,
						startAngle: 220,
						endAngle: -40,
						splitNumber: 5,
						axisLine: { // 坐标轴线
							lineStyle: { // 属性lineStyle控制线条样式
								width: 8,//仪表厚度
							},
						},
						axisLabel: { //刻度标签
							distance: 0.1,
							show: true,
							fontWeight: 'lighter',
							fontSize: 10,
							fontFamily: '微软雅黑',
						},
						axisTick: { // 坐标轴小标记
							splitNumber: 5,
							length: 10, // 属性length控制线长
							lineStyle: { // 属性lineStyle控制线条样式
								color: 'auto',
							},
						},
						splitLine: { //刻度线
							show: true,
							length: 12,
							lineStyle: {
								color: 'white',
							},
						},
						pointer: { // 指针
							shadowColor: '#fff', //默认透明
							shadowBlur: 5,
							width: 3,
						},

						detail: {
							formatter: '{value}%',
							offsetCenter: [0, 30],
							textStyle: {
								fontSize: 15,
							},
						},
						data: [{ value: data.volteIndicators.iMSRegisterSuccessRate }],
					}],
				};
				/**仪表图2——始呼持续时长*/
				let EChartsOption4 = {
					title: {
						text: '始呼接续时长',
						x: 'center',
						bottom: 'bottom',
						textStyle: {
							color: '#000000',
							fontFamily: '微软雅黑',
							fontWeight: 'normal',
							fontSize: 11,
						},
					},
					tooltip: {
						formatter: '{a}:<br/> {c}s',
						position: ['50%', '30%'],
					},
					series: [{
						name: '始呼接续时长',
						type: 'gauge',
						radius: '98%',
						min: 0,
						max: 10,
						splitNumber: 5,
						axisLine: {
							show: true,
							lineStyle: {
								width: 12,
								shadowBlur: 0,
								color: [
									[0.2, '#E43F3D'],
									[0.4, '#E98E2C'],
									[0.6, '#DDBD4D'],
									[0.8, '#7CBB55'],
									[1, '#9CD6CE'],
								],
							},
						},
						axisTick: {
							show: true,
							splitNumber: 1,
						},
						splitLine: {
							show: true,
							length: 12,
							lineStyle: {
								//color:'black'
							},
						},
						axisLabel: {
							formatter: function (e) {
								// switch (e + "") {
								//     case "400":
								//         return "较差";
								//         //return "";
								//     case "1200":
								//         return "中等";
								//         //return "";
								//     case "2000":
								//         return "良好";
								//         //return "";
								//     case "2800":
								//         return "优秀";
								//         //return "";
								//     case "3600":
								//         return "极好";
								//         //return "";
								//     default:
								//         return e;
								// };
								//console.log(e);
								return parseInt(e);
							},
							textStyle: {
								distance: 0.1,
								show: true,
								fontWeight: 'lighter',
								fontSize: 10,
								fontFamily: '微软雅黑',
							},
							distance: 1,
						},
						pointer: {
							show: true,
							shadowBlur: 5,
							width: 3,
						},
						detail: {
							show: true,
							formatter: function (params) {
								// let level = '';
								// if (param < 400) {
								//     level = '较差'
								// } else if (param < 800) {
								//     level = '中等'
								// } else if (param < 1200) {
								//     level = '良好'
								// } else if (param < 1600) {
								//     level = '优秀'
								// } else if (param <= 2000) {
								//     level = '极好'
								// } else {
								//     level = '暂无';
								// }
								// return level;
								return params + 's';
							},
							offsetCenter: [0, 30],
							textStyle: {
								fontSize: 15,
							},
						},
						data: [{
							name: '',
							value: data.volteIndicators.volteInitialCallConnectionDuration,
						}],
					}],
				};
				/**仪表图3——语音始呼接通率*/
				let EChartsOption5 = {
					title: {
						text: '语音始呼接通率',
						x: 'center',
						bottom: 'bottom',
						textStyle: {
							color: '#000000',
							fontFamily: '微软雅黑',
							fontWeight: 'normal',
							fontSize: 11,
						},
					},
					tooltip: {
						formatter: '{a}:<br/> {c}%',
						position: ['-30%', '30%'],
					},
					axisLabel: {
						fontSize: '10',
						show: false,
					},
					series: [{
						name: '语音始呼接通率',
						type: 'gauge',
						radius: '98%',
						min: 0,
						max: 100,
						startAngle: 220,
						endAngle: -40,
						splitNumber: 5,
						axisLine: { // 坐标轴线
							lineStyle: { // 属性lineStyle控制线条样式
								width: 8,//仪表厚度
							},
						},
						axisLabel: { //刻度标签
							distance: 0.1,
							show: true,
							fontWeight: 'lighter',
							fontSize: 10,
							fontFamily: '微软雅黑',
						},
						axisTick: { // 坐标轴小标记
							splitNumber: 5,
							length: 10, // 属性length控制线长
							lineStyle: { // 属性lineStyle控制线条样式
								color: 'auto',
							},
						},
						splitLine: { //刻度线
							show: true,
							length: 12,
							lineStyle: {
								color: 'white',
							},
						},
						pointer: { // 指针
							shadowColor: '#fff', //默认透明
							shadowBlur: 5,
							width: 3,
						},

						detail: {
							formatter: '{value}%',
							offsetCenter: [0, 30],
							textStyle: {
								fontSize: 15,
								fontFamily: '微软雅黑',
							},
						},
						data: [{ value: data.volteIndicators.volteVoiceInitialCallConnectionRate }],
					}],
				};
				if (screenWidth < 1366) {
					EChartsOption1.grid.height = 230;
					EChartsOption1.series[0].barWidth = '33%';
					EChartsOption2.grid.height = 230;
					EChartsOption2.series[0].barWidth = '33%';
					EChartsOption3.title.bottom = '-5%';
					EChartsOption4.title.bottom = '-5%';
					EChartsOption5.title.bottom = '-5%';
					EChartsOption3.series[0].detail.offsetCenter = [0, 29];
					EChartsOption4.series[0].detail.offsetCenter = [0, 29];
					EChartsOption5.series[0].detail.offsetCenter = [0, 29];
				}
				switch (screenWidth) {
					case 1366:
						EChartsOption1.grid.height = 230;
						EChartsOption1.series[0].barWidth = '33%';
						EChartsOption2.grid.height = 230;
						EChartsOption2.series[0].barWidth = '33%';
						EChartsOption3.title.bottom = '-5%';
						EChartsOption4.title.bottom = '-5%';
						EChartsOption5.title.bottom = '-5%';
						break;
					case 1400:
						EChartsOption1.grid.height = 350;
						EChartsOption1.series[0].barWidth = '33%';
						EChartsOption1.series[0].label.normal.textStyle.fontSize = 9;
						EChartsOption1.title.textStyle.fontSize = 13;
						EChartsOption2.grid.height = 350;
						EChartsOption2.series[0].barWidth = '33%';
						EChartsOption2.series[0].label.normal.textStyle.fontSize = 9;
						EChartsOption2.title.textStyle.fontSize = 13;
						EChartsOption3.series[0].detail.offsetCenter = [0, 45];
						EChartsOption4.series[0].detail.offsetCenter = [0, 45];
						EChartsOption5.series[0].detail.offsetCenter = [0, 45];
						break;
					case 1440:
					case 1600:
						EChartsOption1.grid.height = 280;
						EChartsOption1.series[0].barWidth = '33%';
						EChartsOption1.series[0].label.normal.textStyle.fontSize = 10;
						EChartsOption1.title.textStyle.fontSize = 12;
						EChartsOption2.grid.height = 280;
						EChartsOption2.series[0].barWidth = '33%';
						EChartsOption2.series[0].label.normal.textStyle.fontSize = 10;
						EChartsOption2.title.textStyle.fontSize = 12;
						EChartsOption3.series[0].detail.offsetCenter = [0, 35];
						EChartsOption4.series[0].detail.offsetCenter = [0, 35];
						EChartsOption5.series[0].detail.offsetCenter = [0, 35];
						break;
					case 1680:
						EChartsOption1.grid.height = 330;
						EChartsOption1.series[0].barWidth = '30%';
						EChartsOption1.series[0].label.normal.textStyle.fontSize = 10;
						EChartsOption1.title.textStyle.fontSize = 15;
						EChartsOption2.grid.height = 330;
						EChartsOption2.series[0].barWidth = '30%';
						EChartsOption2.series[0].label.normal.textStyle.fontSize = 10;
						EChartsOption2.title.textStyle.fontSize = 15;
						EChartsOption3.series[0].detail.offsetCenter = [0, 45];
						EChartsOption4.series[0].detail.offsetCenter = [0, 45];
						EChartsOption5.series[0].detail.offsetCenter = [0, 45];
						break;
					case 1920:
						EChartsOption1.grid.height = 360;
						EChartsOption1.series[0].barWidth = '30%';
						EChartsOption1.series[0].label.normal.textStyle.fontSize = 10;
						EChartsOption1.title.textStyle.fontSize = 15;
						EChartsOption2.grid.height = 360;
						EChartsOption2.series[0].barWidth = '30%';
						EChartsOption2.series[0].label.normal.textStyle.fontSize = 10;
						EChartsOption2.title.textStyle.fontSize = 15;
						EChartsOption3.series[0].detail.offsetCenter = [0, 45];
						EChartsOption4.series[0].detail.offsetCenter = [0, 45];
						EChartsOption5.series[0].detail.offsetCenter = [0, 45];
						break;
					default:
						break;
				}
				chart1.setOption(EChartsOption1);
				chart2.setOption(EChartsOption2);
				chart3.setOption(EChartsOption3);
				chart4.setOption(EChartsOption4);
				chart5.setOption(EChartsOption5);
				if (isInitialize) {
					chart1.hideLoading();
					chart2.hideLoading();
					chart3.hideLoading();
					chart4.hideLoading();
					chart5.hideLoading();
				}
			}, () => {
				if (isInitialize) {
					chart1.hideLoading();
					chart2.hideLoading();
					chart3.hideLoading();
					chart4.hideLoading();
					chart5.hideLoading();
				}
			});
		},
		/** 网元速率表page1~page3 */
		getNetworkElementRate: (isInitialize, loadingStyle) => {
			let url = APIS.index.networkElementRate;
			let param = {
				timeSlot: beforeNowDate(),
				cityOid: cityId
			};

			let chart1 = echarts.getInstanceByDom(document.getElementById('nerChart1'));
			let chart2 = echarts.getInstanceByDom(document.getElementById('nerChart2'));
			let chart3;
			let chart4;
			if ($scope.networkChartPage3 == true) {
				chart3 = echarts.getInstanceByDom(document.getElementById('nerChart3'));
			}
			if ($scope.networkChartPage4 == true) {
				chart4 = echarts.getInstanceByDom(document.getElementById('nerChart4'));
			}

			if (isInitialize) {
				chart1.showLoading(loadingStyle);
				chart2.showLoading(loadingStyle);
				if ($scope.networkChartPage3 == true) {
					chart3.showLoading(loadingStyle);
				}
				if ($scope.networkChartPage4 == true) {
					chart4.showLoading(loadingStyle);
				}
			}

			HttpRequestService.get(url, param, data => {
				let rate1 = [];
				let rate2 = [];
				let rate3 = [];
				let rate4 = [];
				let networkElement1 = [];
				let networkElement2 = [];
				let networkElement3 = [];
				let networkElement4 = [];
				switch ($scope.logingOfCity) {
					case 'huizhou':
					case 'chaozhou':
						for (let i = 0; i < data.length; i++) {
							if (i <= 6) {
								rate1.push(data[i].downloadRate);
								networkElement1.push(data[i].netElement);
							}
							else {
								rate2.push(data[i].downloadRate);
								networkElement2.push(data[i].netElement);
							}
						}
						break;
					case 'shaoguan':
						for (let i = 0; i < data.length; i++) {
							if (i <= 7) {
								rate1.push(data[i].downloadRate);
								networkElement1.push(data[i].netElement);
							}
							else if (i <= 15) {
								rate2.push(data[i].downloadRate);
								networkElement2.push(data[i].netElement);
							}
							else if (i <= 24) {
								rate3.push(data[i].downloadRate);
								networkElement3.push(data[i].netElement);
							}
							else {
								rate4.push(data[i].downloadRate);
								networkElement4.push(data[i].netElement);
							}
						}
						break;
					case 'zhongshan':
						for (let i = 0; i < data.length; i++) {
							if (i <= 6) {
								rate1.push(data[i].downloadRate);
								networkElement1.push(data[i].netElement);
							}
							else if (i <= 13) {
								rate2.push(data[i].downloadRate);
								networkElement2.push(data[i].netElement);
							}
							else {
								rate3.push(data[i].downloadRate);
								networkElement3.push(data[i].netElement);
							}
						}
						break;
					case 'zhuhai':
						for (let i = 0; i < data.length; i++) {
							if (i < 7) {
								rate1.push(data[i].downloadRate);
								networkElement1.push(data[i].netElement);
							}
							else if (i < 14) {
								rate2.push(data[i].downloadRate);
								networkElement2.push(data[i].netElement);
							}
							else if (i < 21) {
								rate3.push(data[i].downloadRate);
								networkElement3.push(data[i].netElement);
							}
							else {
								rate4.push(data[i].downloadRate);
								networkElement4.push(data[i].netElement);
							}
						}
						break;
					case 'maoming':
						for (let i = 0; i < data.length; i++) {
							if (i < 7) {
								rate1.push(data[i].downloadRate);
								networkElement1.push(data[i].netElement);
							}
							else if (i < 14) {
								rate2.push(data[i].downloadRate);
								networkElement2.push(data[i].netElement);
							}
							else if (i < 21) {
								rate3.push(data[i].downloadRate);
								networkElement3.push(data[i].netElement);
							}
							else {
								rate4.push(data[i].downloadRate);
								networkElement4.push(data[i].netElement);
							}
						}
					default:
						break;
				}

				//console.log(rate1.max());
				//console.log(rate2.max());
				//第一页
				let EChartsOption1 = {
					color: ['#3398DB'],
					title: {
						text: '单位：Mbps',
						left: '68%',
						top: '8%',
						textStyle: {
							fontSize: 11,
							align: 'right',
						},
					},
					tooltip: {
						formatter: '{b} <br/>{c} Mbps',
					},
					legend: {},
					xAxis: {
						axisTick: {
							show: false,
						},
						data: networkElement1,
						type: 'category',
						axisLabel: {
							interval: 0,
							margin: 8,
							//rotate: 50,
							textStyle: {
								fontSize: 11,
							},
							formatter: function (params) {
								let newParamsName = ''; // 最终拼接成的字符串
								let paramsNameNumber = params.length; // 实际标签的个数
								let provideNumber = 3; // 每行能显示的字的个数
								let rowNumber = Math.ceil(paramsNameNumber / provideNumber); // 换行的话，需要显示几行，向上取整

								// 条件等同于rowNumber>1
								if (paramsNameNumber > provideNumber) {
									for (let p = 0; p < rowNumber; p++) {
										let tempStr = ''; // 表示每一次截取的字符串
										let start = p * provideNumber; // 开始截取的位置
										let end = start + provideNumber; // 结束截取的位置
										// 此处特殊处理最后一行的索引值
										if (p === (rowNumber - 1)) {
											// 最后一次不换行
											tempStr = params.substring(start, paramsNameNumber);
										} else {
											// 每一次拼接字符串并换行
											tempStr = params.substring(start, end) + '\n';
										}
										newParamsName += tempStr; // 最终拼成的字符串
									}
								} else {
									// 将旧标签的值赋给新标签
									newParamsName = params;
								}
								//将最终的字符串返回
								return newParamsName;
							},
						},
					},
					yAxis: {
						axisTick: {
							show: false,
						},
						splitLine: { show: false },
						min: 0,
						max: 4,
						//interval:1,
					},
					series: [{
						name: 'Mbps',
						type: 'bar',
						barWidth: '40%',
						itemStyle: {
							normal: {
								//柱形图圆角，初始化效果
								barBorderRadius: [5, 5, 0, 0],
							},
						},
						data: rate1,
					}],
				};
				//第二页
				let EChartsOption2 = {
					color: ['#3398DB'],
					title: {
						text: '单位：Mbps',
						left: '68%',
						top: '8%',
						textStyle: {
							fontSize: 11,
							align: 'right',
						},
					},
					tooltip: {
						formatter: '{b} <br/>{c} Mbps',
					},
					legend: {},
					xAxis: {
						axisTick: {
							show: false,
						},
						data: networkElement2,
						type: 'category',
						axisLabel: {
							interval: 0,
							margin: 8,
							//rotate: 50,
							textStyle: {
								fontSize: 11,
							},
							formatter: function (params) {
								let newParamsName = ''; // 最终拼接成的字符串
								let paramsNameNumber = params.length; // 实际标签的个数
								let provideNumber = 3; // 每行能显示的字的个数
								let rowNumber = Math.ceil(paramsNameNumber / provideNumber); // 换行的话，需要显示几行，向上取整

								// 条件等同于rowNumber>1
								if (paramsNameNumber > provideNumber) {
									for (let p = 0; p < rowNumber; p++) {
										let tempStr = ''; // 表示每一次截取的字符串
										let start = p * provideNumber; // 开始截取的位置
										let end = start + provideNumber; // 结束截取的位置
										// 此处特殊处理最后一行的索引值
										if (p === rowNumber - 1) {
											// 最后一次不换行
											tempStr = params.substring(start, paramsNameNumber);
										} else {
											// 每一次拼接字符串并换行
											tempStr = params.substring(start, end) + '\n';
										}
										newParamsName += tempStr; // 最终拼成的字符串
									}
								} else {
									// 将旧标签的值赋给新标签
									newParamsName = params;
								}
								//将最终的字符串返回
								return newParamsName;
							},
						},
					},
					yAxis: {
						axisTick: {
							show: false,
						},
						splitLine: { show: false },
						min: 0,
						max: 4,
						interval: 1,
					},
					series: [{
						name: 'Mbps',
						type: 'bar',
						barWidth: '45%',
						itemStyle: {
							normal: {
								//柱形图圆角，初始化效果
								barBorderRadius: [5, 5, 0, 0],
							},
						},
						data: rate2,
					}],
				};
				//第三页
				let EChartsOption3 = {
					color: ['#3398DB'],
					title: {
						text: '单位：Mbps',
						left: '68%',
						top: '8%',
						textStyle: {
							fontSize: 11,
							align: 'right',
						},
					},
					tooltip: {
						formatter: '{b} <br/>{c} Mbps',
					},
					legend: {},
					xAxis: {
						axisTick: {
							show: false,
						},
						data: networkElement3,
						type: 'category',
						axisLabel: {
							interval: 0,
							margin: 8,
							//rotate: 50,
							textStyle: {
								fontSize: 11,
							},
							formatter: function (params) {
								let newParamsName = ''; // 最终拼接成的字符串
								let paramsNameNumber = params.length; // 实际标签的个数
								let provideNumber = 3; // 每行能显示的字的个数
								let rowNumber = Math.ceil(paramsNameNumber / provideNumber); // 换行的话，需要显示几行，向上取整

								// 条件等同于rowNumber>1
								if (paramsNameNumber > provideNumber) {
									for (let p = 0; p < rowNumber; p++) {
										let tempStr = ''; // 表示每一次截取的字符串
										let start = p * provideNumber; // 开始截取的位置
										let end = start + provideNumber; // 结束截取的位置
										// 此处特殊处理最后一行的索引值
										if (p === rowNumber - 1) {
											// 最后一次不换行
											tempStr = params.substring(start, paramsNameNumber);
										} else {
											// 每一次拼接字符串并换行
											tempStr = params.substring(start, end) + '\n';
										}
										newParamsName += tempStr; // 最终拼成的字符串
									}
								} else {
									// 将旧标签的值赋给新标签
									newParamsName = params;
								}
								//将最终的字符串返回
								return newParamsName;
							},
						},
					},
					yAxis: {
						axisTick: {
							show: false,
						},
						splitLine: { show: false },
						min: 0,
						max: 4,
						interval: 1,
					},
					series: [{
						name: 'Mbps',
						type: 'bar',
						barWidth: '45%',
						itemStyle: {
							normal: {
								//柱形图圆角，初始化效果
								barBorderRadius: [5, 5, 0, 0],
							},
						},
						data: rate3,
					}],
				};
				//第四页
				let EChartsOption4 = {
					color: ['#3398DB'],
					title: {
						text: '单位：Mbps',
						left: '68%',
						top: '8%',
						textStyle: {
							fontSize: 11,
							align: 'right',
						},
					},
					tooltip: {
						formatter: '{b} <br/>{c} Mbps',
					},
					legend: {},
					xAxis: {
						axisTick: {
							show: false,
						},
						data: networkElement4,
						type: 'category',
						axisLabel: {
							interval: 0,
							margin: 8,
							//rotate: 50,
							textStyle: {
								fontSize: 11,
							},
							formatter: function (params) {
								let newParamsName = ''; // 最终拼接成的字符串
								let paramsNameNumber = params.length; // 实际标签的个数
								let provideNumber = 3; // 每行能显示的字的个数
								let rowNumber = Math.ceil(paramsNameNumber / provideNumber); // 换行的话，需要显示几行，向上取整

								// 条件等同于rowNumber>1
								if (paramsNameNumber > provideNumber) {
									for (let p = 0; p < rowNumber; p++) {
										let tempStr = ''; // 表示每一次截取的字符串
										let start = p * provideNumber; // 开始截取的位置
										let end = start + provideNumber; // 结束截取的位置
										// 此处特殊处理最后一行的索引值
										if (p === rowNumber - 1) {
											// 最后一次不换行
											tempStr = params.substring(start, paramsNameNumber);
										} else {
											// 每一次拼接字符串并换行
											tempStr = params.substring(start, end) + '\n';
										}
										newParamsName += tempStr; // 最终拼成的字符串
									}
								} else {
									// 将旧标签的值赋给新标签
									newParamsName = params;
								}
								//将最终的字符串返回
								return newParamsName;
							},
						},
					},
					yAxis: {
						axisTick: {
							show: false,
						},
						splitLine: { show: false },
						min: 0,
						max: 4,
						interval: 1,
					},
					series: [{
						name: 'Mbps',
						type: 'bar',
						barWidth: '45%',
						itemStyle: {
							normal: {
								//柱形图圆角，初始化效果
								barBorderRadius: [5, 5, 0, 0],
							},
						},
						data: rate4,
					}],
				};
				if (rate1.max() > 4) {
					EChartsOption1.yAxis.max = Math.ceil(rate1.max());
				}
				if (rate2.max() > 4) {
					EChartsOption2.yAxis.max = Math.ceil(rate2.max());
				}
				if (rate3.max() > 4) {
					EChartsOption3.yAxis.max = Math.ceil(rate3.max());
				}
				if (rate4.max() > 4) {
					EChartsOption4.yAxis.max = Math.ceil(rate4.max());
				}
				chart1.setOption(EChartsOption1);
				chart2.setOption(EChartsOption2);
				if ($scope.networkChartPage3 == true) {
					chart3.setOption(EChartsOption3);
				}
				if ($scope.networkChartPage4 == true) {
					chart4.setOption(EChartsOption4);
				}

				if (isInitialize) {
					chart1.hideLoading();
					chart2.hideLoading();
					if ($scope.networkChartPage3 == true) {
						chart3.hideLoading();
					}
					if ($scope.networkChartPage4 == true) {
						chart4.hideLoading();
					}
				}
			}, () => {
				if (isInitialize) {
					chart1.hideLoading();
					chart2.hideLoading();
					if ($scope.networkChartPage3 == true) {
						chart3.hideLoading();
					}
					if ($scope.networkChartPage4 == true) {
						chart4.hideLoading();
					}
				}
			});
		},
		/** 业务分布表 */
		getBusinessDistribute: (isInitialize, loadingStyle) => {
			/**上半部饼图部分*/
			let url1 = APIS.index.businessDistributionPie;
			let param = {
				timeSlot: beforeNowDate(),
				cityOid: cityId
			};
			//let chart1 = echarts.getInstanceByDom(document.getElementById('bpChart1'));
			//let chart2 = echarts.getInstanceByDom(document.getElementById('bpChart2'));
			let aChart = echarts.getInstanceByDom(document.getElementById('aChart'));
			// let demoData1 = [
			//     {value: 21, name: '视频'},
			//     {value: 14, name: '其余'},
			//     {value: 11, name: '浏览下载'},
			//     {value: 10, name: '音乐'},
			//     {value: 8, name: '应用商店'},
			//     {value: 7, name: '游戏'},
			//     {value: 6, name: '其他'},
			//     {value: 5, name: '微博社区'},
			//     {value: 5, name: '即时通信'},
			//     {value: 4, name: '导航'},
			//     {value: 3, name: '阅读'},
			//     {value: 3, name: '支付'},
			//     {value: 2, name: '财经'},
			//     {value: 1, name: '杀毒'},
			// ];
			// let demoData2 = [
			//     {value: 4, name: '购物'},
			//     {value: 3, name: 'VoIP服务'},
			//     {value: 3, name: '网盘云'},
			//     {value: 2, name: '邮箱'},
			//     {value: 2, name: '出行旅游'},
			//     {value: 2, name: 'p2p'},
			//     {value: 1, name: '彩信'},
			//     {value: 1, name: '动漫'},
			// ];
			if (isInitialize) {
				/*chart1.showLoading(loadingStyle);
				 chart2.showLoading(loadingStyle);*/
				aChart.showLoading(loadingStyle);
			}
			HttpRequestService.get(url1, param, data => {
				/*let sumValue = 0;
				 let mainData = [];
				 let restData = [];*/
				/*for (let i = 0; i < data.length; i++) {
				 switch (data[i].appTypeName) {
				 case '即时通信':
				 data[i].appTypeName = '通信';
				 break;
				 case '浏览下载':
				 data[i].appTypeName = '下载';
				 break;
				 case '网盘云服务':
				 data[i].appTypeName = '网盘';
				 break;
				 case '出行旅游':
				 data[i].appTypeName = '出行';
				 break;
				 case '微博社区':
				 data[i].appTypeName = '微博';
				 break;
				 case 'VoIP业务':
				 data[i].appTypeName = 'VoIP';
				 break;
				 case 'P2P业务':
				 data[i].appTypeName = 'P2P';
				 break;
				 case '安全杀毒':
				 data[i].appTypeName = '杀毒';
				 break;
				 case '应用商店':
				 data[i].appTypeName = '应用';
				 break;
				 default:
				 break;
				 }
				 if (i <= 12) {
				 mainData.push(
				 {
				 value: parseInt(data[i].proportion),
				 name: data[i].appTypeName,
				 });
				 }else {
				 restData.push({
				 value: parseInt(data[i].proportion),
				 name: data[i].appTypeName,
				 });
				 sumValue += parseInt(data[i].proportion);
				 }
				 //console.log(restData);
				 }
				 mainData.unshift({
				 value: sumValue,
				 name: '其余',
				 });*/
				/**饼图1——主要业务分布 */
				/*let EChartsOption1 = {
				 tooltip: {
				 trigger: 'item',
				 formatter: function (params) {
				 let res = '业务分布<br/>';
				 let name = '';
				 //console.log(params);
				 switch (params.name) {
				 case '通信':
				 name = '即时通信';
				 break;
				 case '下载':
				 name = '浏览下载';
				 break;
				 case '网盘':
				 name = '网盘云服务';
				 break;
				 case '出行':
				 name = '出行旅游';
				 break;
				 case '微博':
				 name = '微博社区';
				 break;
				 case 'VoIP':
				 name = 'VoIP业务';
				 break;
				 case 'P2P':
				 name = 'P2P业务';
				 break;
				 case '杀毒':
				 name = '安全杀毒';
				 break;
				 case '应用':
				 name = '应用商店';
				 break;
				 default:
				 name = params.name;
				 }

				 res += name + ' : ' + params.value + '%';
				 return res;
				 },
				 },
				 series: [{
				 name: '业务分布',
				 type: 'pie',
				 radius: '65%',
				 startAngle: 180,
				 minAngle: 5,
				 clockwise: true,
				 center: ['50%', '50%'],//color: ['#5F7530','#772C2A','#4D3B62','#286A7C','#B65708','#729ACA','#358EA6','#C0504D','#9BBB59','#8064A2','#4BACC6','#F79646','#FF20A4','#2C4D75'],
				 color: ['#6104B4', '#0908FA', '#047FFC', '#00FC81', '#04FD04', '#81FD04', '#FDF100', '#FC7F01', '#FE0000', '#E62B8B', '#F80B97', '#FE00FB', '#FA92CF', '#B47CE6'],
				 data: mainData,
				 itemStyle: {
				 normal: {
				 borderColor: 'white',
				 label: {
				 show: true,
				 position: ['50%', '80%'],
				 textStyle: {
				 fontWeight: 'normal',
				 fontSize: 9,
				 fontFamily: '微软雅黑',
				 color: '#9D9D9D',
				 },
				 formatter: '{b} \n{d}%',
				 },
				 labelLine: {
				 show: true,
				 length: 3,
				 length2: 6,
				 // smooth: 0.8
				 },
				 },
				 emphasis: {
				 shadowBlur: 10,
				 shadowOffsetX: 0,
				 shadowColor: 'rgba(0, 0, 0, 0.5)',
				 },
				 },
				 }],
				 };*/
				/**饼图2——其他业务分布 */
				/*let EChartsOption2 = {
				 tooltip: {
				 trigger: 'item',
				 //formatter: "{a} <br/>{b} : {c}% "
				 formatter: function (params) {
				 let res = '业务分布<br/>';
				 let name = '';
				 //console.log(params);
				 switch (params.name) {
				 case '通信':
				 name = '即时通信';
				 break;
				 case '下载':
				 name = '浏览下载';
				 break;
				 case '网盘':
				 name = '网盘云服务';
				 break;
				 case '出行':
				 name = '出行旅游';
				 break;
				 case '微博':
				 name = '微博社区';
				 break;
				 case 'VoIP':
				 name = 'VoIP业务';
				 break;
				 case 'P2P':
				 name = 'P2P业务';
				 break;
				 case '杀毒':
				 name = '安全杀毒';
				 break;
				 case '应用':
				 name = '应用商店';
				 break;
				 default:
				 name = params.name;
				 }

				 res += name + ' : ' + params.value + '%';
				 return res;
				 },
				 },
				 series: [{
				 name: '业务分布',
				 type: 'pie',
				 startAngle: 180,
				 radius: '64%',
				 minAngle: 5,
				 center: ['50%', '50%'],
				 //color: ['#9A3E39', '#7E9D40', '#B2BF84', '#9983B1','#6FBECD','#FAAB67','#3A689C','#4A3862'],
				 color: ['#FE0000', '#FC7F01', '#FDF100', '#81FD04', '#04FD04', '#047FFC', '#6104B4', '#F80B97'],
				 data: restData,
				 itemStyle: {
				 normal: {
				 borderColor: 'white',
				 label: {
				 show: true,
				 position: ['50%', '80%'],
				 textStyle: {
				 fontWeight: 'normal',
				 fontSize: 9,
				 fontFamily: '微软雅黑',
				 color: '#9D9D9D',
				 },
				 formatter: '{b} \n{c}%',
				 },
				 labelLine: {
				 show: true,
				 length: 3,
				 length2: 3,
				 // smooth: 0.8
				 },
				 },
				 emphasis: {
				 shadowBlur: 10,
				 shadowOffsetX: 0,
				 shadowColor: 'rgba(0, 0, 0, 0.5)',
				 },
				 },
				 }],
				 };*/

				/**x轴坐标*/
				let xData = [];
				let yData = [];
				let percentData = [];
				for (let i = 0; i < data.length; i++) {
					xData.push(data[i].appTypeName);
					yData.push(data[i].flow);
					percentData.push(data[i].flowRatio)
				}
				/**面积图*/
				let aChartOption = {
					tooltip: {
						show: true,
						trigger: 'axis',
						//formatter: "业务大类：{b} <br/>流量：{c}GB<br/>占比： "
						formatter: function (params) {
							let res = '业务大类：' + params[0].name + '<br>' + '流量：' + params[0].data + 'GB' + '<br>' + '占比：' + percentData[params[0].dataIndex] + '%';
							return res;
						},
					},
					grid: {
						top: 30,//距离容器上边界40像素
						bottom: 90,   //距离容器下边界30像素
						left: '12%',
						right: '15%',
					},
					xAxis: {
						type: 'category',
						boundaryGap: false,
						name: "类型",
						data: xData,
						axisLabel: {
							interval: 0,
							rotate: 45,
							textStyle: {
								fontSize: 10
							}
						},
					},
					yAxis: {
						name: "流量（GB）",
						axisLabel: {
							textStyle: {
								fontSize: 10
							}
						},
					},
					dataZoom: [{
						show: true,
						realtime: true,
						start: 0,
						end: 60,
						height: 20,
						textStyle: {
							fontSize: 10
						}
					}, {
						type: 'inside',
					}],
					series: [{
						type: 'line',
						smooth: true,
						symbol: 'emptyCircle',//标记
						sampling: 'average',
						itemStyle: {
							normal: {
								color: '#FF9933'
							}
						},
						areaStyle: {
							normal: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
									offset: 0,
									color: '#FF9933'
								}, {
									offset: 1,
									color: '#de852d'
								}])
							}
						},
						data: yData
					}]
				};
				//alert(JSON.stringify(params));
				/*switch (screenWidth) {
				 case 1440:
				 EChartsOption1.series[0].radius = '72%';
				 EChartsOption2.series[0].radius = '67%';
				 break;
				 case 1600:
				 EChartsOption1.series[0].radius = '73%';
				 EChartsOption2.series[0].radius = '70%';
				 break;
				 case 1680:
				 EChartsOption1.series[0].radius = '75%';
				 EChartsOption2.series[0].radius = '72%';
				 break;
				 case 1920:
				 EChartsOption1.series[0].radius = '80%';
				 EChartsOption2.series[0].radius = '75%';
				 break;
				 default:
				 break;
				 }
				 chart1.setOption(EChartsOption1);
				 chart2.setOption(EChartsOption2);*/

				switch (screenWidth) {
					case 1366:
						aChartOption.grid.left = '14.5%';
						break;
					case 1440:
					case 1400:
						aChartOption.grid.left = '13%';
						break;
					case 1600:
					case 1680:
						aChartOption.grid.left = '12.5%';
						aChartOption.grid.right = '13%';
						break;
					default:
						break;
				}
				aChart.setOption(aChartOption);

				if (isInitialize) {
					//chart1.hideLoading();
					//chart2.hideLoading();
					aChart.hideLoading();
				}
			}, () => {
				if (isInitialize) {
					//chart1.hideLoading();
					//chart2.hideLoading();
					aChart.hideLoading();
				}
			});

			////////////////////////////////////////////////////////////////////////////////////////////////
			/** 下半部双向柱性图部分 */
			getTwoBarAnalysis(isInitialize, loadingStyle);
		},
		/** 惠州地图 */
		getHuizhouMap: (isInitialize, loadingStyle) => {
			let url1 = APIS.index.wholeNetworkDownloadFlowAndSubscribers;
			let url2 = APIS.index.areaDownloadFlowAndSubscribers;
			let url3 = APIS.index.areaKeyIndicators;
			let param = {
				timeSlot: beforeNowDate(),
				cityOid: cityId
			};
			HttpRequestService.get(url1, param, data => {
				$scope.totalFlow = (data[0].flow / 1024).toFixed(2);
				$scope.totalUsercount = (data[0].subscriberCount / 10000).toFixed(2);
				$scope.total4GFlow = (data[0].subscriberCount4G / 10000).toFixed(2);
				$scope.total2and3GFlow = (data[0].subscriberCount2G3G / 10000).toFixed(2);
			});
			HttpRequestService.get(url3, param, data => {
				if (data == '') {
					return;
				}
				if ($scope.logingOfCity === 'huizhou') {
					/**清空数据*/
					$('#myTable').find('table').find('tbody').find('td').remove();
					$('#myTable').find('table').find('thead').find('th').remove();
					/** 指标名称 */
					$('.indicatorsHz').append('<th>指标</th>');
					$('#downloadRate').append('<td>500K下载速率(Mbps)</td>');
					$('#httpDelay').append('<td>HTTP响应时延(ms)</td>');
					$('#webpageSuccessRate').append('<td>页面显示成功率</td>');
					$('#appStoreProportion').append('<td>商店500Kbps以下占比</td>');
					$('#instantMessengerSuccess').append('<td>即时通信响应成功率</td>');
					$('#instantMessengerDelay').append('<td>即时通信响应平均时延(ms)</td>');
					$('#browseAppPageDisplayLow').append('<td>网页显示5s以上占比</td>');
					$('#browseAppPageDisplayAvg').append('<td>网页显示平均时长(s)</td>');
					$('#videoSuccess').append('<td>视频访问成功率</td>');
					$('#videoDelay').append('<td>视频业务响应时延(ms)</td>');
					$('#gameSuccess').append('<td>游戏业务访问成功率</td>');
					$('#gameDelay').append('<td>游戏业务响应时延(ms)</td>');
					$('#browseSuccess').append('<td>浏览业务访问成功率</td>');
					$('#browseDelay').append('<td>浏览业务响应时延(ms)</td>');
					for (let i = 0; i < data.length; i++) {
						/**指标*/
						$('.indicatorsHz').append('<th>' + data[i].coverArea + '</th>');
						/**500K下载速率(Mbps)*/
						$('#downloadRate').append('<td>' + data[i].rate + '</td>');
						/**HTTP响应时延(ms)*/
						$('#httpDelay').append('<td>' + data[i].delay + '</td>');
						/**页面显示成功率*/
						$('#webpageSuccessRate').append('<td>' + data[i].pageDisplaySuccessRate + '%</td>');
						/**商店500Kbps以下占比*/
						$('#appStoreProportion').append('<td>' + data[i].appStoreDlRate500KbRatio + '%</td>');
						/**即时通信响应成功率*/
						$('#instantMessengerSuccess').append('<td>' + data[i].instantMessageSuccessRate + '%</td>');
						/**即时通信响应平均时延(ms)*/
						$('#instantMessengerDelay').append('<td>' + data[i].instantMessageResponseDelay + '</td>');
						/**网页显示5s以上占比*/
						$('#browseAppPageDisplayLow').append('<td>' + data[i].pageDisplayDurationRatio + '%</td>');
						/**网页显示平均时长(s)*/
						$('#browseAppPageDisplayAvg').append('<td>' + data[i].pageDisplayAvgDuration + '</td>');
						/**视频访问成功率*/
						$('#videoSuccess').append('<td>' + data[i].videoResponseSuccessRate + '%</td>');
						/**视频业务响应时延(ms)*/
						$('#videoDelay').append('<td>' + data[i].videoResponseAvgDelay + '</td>');
						/**游戏业务访问成功率*/
						$('#gameSuccess').append('<td>' + data[i].gameResponseSuccessRate + '%</td>');
						/**游戏业务响应时延(ms)*/
						$('#gameDelay').append('<td>' + data[i].gameResponseAvgDelay + '</td>');
						/**浏览业务访问成功率*/
						$('#browseSuccess').append('<td>' + data[i].browseAppSuccessRate + '%</td>');
						/**浏览业务响应时延(ms)*/
						$('#browseDelay').append('<td>' + data[i].browseAppResponseDelay + '</td>');
					}
				}
				else if ($scope.logingOfCity === 'chaozhou') {
					/**清空数据*/
					$('#czTable').find('table').find('tbody').find('td').remove();
					$('#czTable').find('table').find('thead').find('th').remove();
					/** 指标名称 */
					$('.indicatorsCz').append('<th>指标</th>');
					$('#downloadRateCz').append('<td>500K下载速率(Mbps)</td>');
					$('#httpDelayCz').append('<td>HTTP响应时延(ms)</td>');
					$('#webpageSuccessRateCz').append('<td>页面显示成功率</td>');
					$('#appStoreProportionCz').append('<td>商店500Kbps以下占比</td>');
					$('#instantMessengerSuccessCz').append('<td>即时通信响应成功率</td>');
					$('#instantMessengerDelayCz').append('<td>即时通信响应平均时延(ms)</td>');
					$('#browseAppPageDisplayLowCz').append('<td>网页显示5s以上占比</td>');
					$('#browseAppPageDisplayAvgCz').append('<td>网页显示平均时长(s)</td>');
					$('#videoSuccessCz').append('<td>视频访问成功率</td>');
					$('#videoDelayCz').append('<td>视频业务响应时延(ms)</td>');
					$('#gameSuccessCz').append('<td>游戏业务访问成功率</td>');
					$('#gameDelayCz').append('<td>游戏业务响应时延(ms)</td>');
					$('#browseSuccessCz').append('<td>浏览业务访问成功率</td>');
					$('#browseDelayCz').append('<td>浏览业务响应时延(ms)</td>');
					for (let i = 0; i < data.length; i++) {
						$('.indicatorsCz').append('<th>' + data[i].coverArea + '</th>');
						$('#downloadRateCz').append('<td>' + data[i].rate + '</td>');
						$('#httpDelayCz').append('<td>' + data[i].delay + '</td>');
						$('#webpageSuccessRateCz').append('<td>' + data[i].pageDisplaySuccessRate + '%</td>');
						$('#appStoreProportionCz').append('<td>' + data[i].appStoreDlRate500KbRatio + '%</td>');
						$('#instantMessengerSuccessCz').append('<td>' + data[i].instantMessageSuccessRate + '%</td>');
						$('#instantMessengerDelayCz').append('<td>' + data[i].instantMessageResponseDelay + '</td>');
						$('#browseAppPageDisplayLowCz').append('<td>' + data[i].pageDisplayDurationRatio + '%</td>');
						$('#browseAppPageDisplayAvgCz').append('<td>' + data[i].pageDisplayAvgDuration + '</td>');
						$('#videoSuccessCz').append('<td>' + data[i].videoResponseSuccessRate + '%</td>');
						$('#videoDelayCz').append('<td>' + data[i].videoResponseAvgDelay + '</td>');
						$('#gameSuccessCz').append('<td>' + data[i].gameResponseSuccessRate + '%</td>');
						$('#gameDelayCz').append('<td>' + data[i].gameResponseAvgDelay + '</td>');
						$('#browseSuccessCz').append('<td>' + data[i].browseAppSuccessRate + '%</td>');
						$('#browseDelayCz').append('<td>' + data[i].browseAppResponseDelay + '</td>');
					}
				}
				else if ($scope.logingOfCity === 'shaoguan') {
					/**清空数据*/
					$('#sgTable').find('table').find('tbody').find('td').remove();
					$('#sgTable').find('table').find('thead').find('th').remove();
					/** 指标名称 */
					$('.indicatorsSg').append('<th>指标</th>');
					$('#downloadRateSg').append('<td>500K下载速率(Mbps)</td>');
					$('#httpDelaySg').append('<td>HTTP响应时延(ms)</td>');
					$('#webpageSuccessRateSg').append('<td>页面显示成功率</td>');
					$('#appStoreProportionSg').append('<td>商店500Kbps以下占比</td>');
					$('#instantMessengerSuccessSg').append('<td>即时通信响应成功率</td>');
					$('#instantMessengerDelaySg').append('<td>即时通信响应平均时延(ms)</td>');
					$('#browseAppPageDisplayLowSg').append('<td>网页显示5s以上占比</td>');
					$('#browseAppPageDisplayAvgSg').append('<td>网页显示平均时长(s)</td>');
					$('#videoSuccessSg').append('<td>视频访问成功率</td>');
					$('#videoDelaySg').append('<td>视频业务响应时延(ms)</td>');
					$('#gameSuccessSg').append('<td>游戏业务访问成功率</td>');
					$('#gameDelaySg').append('<td>游戏业务响应时延(ms)</td>');
					$('#browseSuccessSg').append('<td>浏览业务访问成功率</td>');
					$('#browseDelaySg').append('<td>浏览业务响应时延(ms)</td>');
					for (let i = 0; i < data.length; i++) {
						$('.indicatorsSg').append('<th>' + data[i].coverArea + '</th>');
						$('#downloadRateSg').append('<td>' + data[i].rate + '</td>');
						$('#httpDelaySg').append('<td>' + data[i].delay + '</td>');
						$('#webpageSuccessRateSg').append('<td>' + data[i].pageDisplaySuccessRate + '%</td>');
						$('#appStoreProportionSg').append('<td>' + data[i].appStoreDlRate500KbRatio + '%</td>');
						$('#instantMessengerSuccessSg').append('<td>' + data[i].instantMessageSuccessRate + '%</td>');
						$('#instantMessengerDelaySg').append('<td>' + data[i].instantMessageResponseDelay + '</td>');
						$('#browseAppPageDisplayLowSg').append('<td>' + data[i].pageDisplayDurationRatio + '%</td>');
						$('#browseAppPageDisplayAvgSg').append('<td>' + data[i].pageDisplayAvgDuration + '</td>');
						$('#videoSuccessSg').append('<td>' + data[i].videoResponseSuccessRate + '%</td>');
						$('#videoDelaySg').append('<td>' + data[i].videoResponseAvgDelay + '</td>');
						$('#gameSuccessSg').append('<td>' + data[i].gameResponseSuccessRate + '%</td>');
						$('#gameDelaySg').append('<td>' + data[i].gameResponseAvgDelay + '</td>');
						$('#browseSuccessSg').append('<td>' + data[i].browseAppSuccessRate + '%</td>');
						$('#browseDelaySg').append('<td>' + data[i].browseAppResponseDelay + '</td>');
					}
				}
				else if ($scope.logingOfCity === 'zhongshan') {
					/**清空数据*/
					$('#zsTable').find('table').find('tbody').find('td').remove();
					$('#zsTable').find('table').find('thead').find('th').remove();
					/** 指标名称 */
					$('.indicatorsZs1').append('<th>指标</th>');
					$('#downloadRateZs1').append('<td>500K下载速率(Mbps)</td>');
					$('#httpDelayZs1').append('<td>HTTP响应时延(ms)</td>');
					$('#webpageSuccessRateZs1').append('<td>页面显示成功率</td>');
					$('#appStoreProportionZs1').append('<td>商店500Kbps以下占比</td>');
					$('#instantMessengerSuccessZs1').append('<td>即时通信响应成功率</td>');
					$('#instantMessengerDelayZs1').append('<td>即时通信响应平均时延(ms)</td>');
					$('#browseAppPageDisplayLowZs1').append('<td>网页显示5s以上占比</td>');
					$('#browseAppPageDisplayAvgZs1').append('<td>网页显示平均时长(s)</td>');
					$('#videoSuccessZs1').append('<td>视频访问成功率</td>');
					$('#videoDelayZs1').append('<td>视频业务响应时延(ms)</td>');
					$('#gameSuccessZs1').append('<td>游戏业务访问成功率</td>');
					$('#gameDelayZs1').append('<td>游戏业务响应时延(ms)</td>');
					$('#browseSuccessZs1').append('<td>浏览业务访问成功率</td>');
					$('#browseDelayZs1').append('<td>浏览业务响应时延(ms)</td>');
					$('.indicatorsZs2').append('<th>指标</th>');
					$('#downloadRateZs2').append('<td>500K下载速率(Mbps)</td>');
					$('#httpDelayZs2').append('<td>HTTP响应时延(ms)</td>');
					$('#webpageSuccessRateZs2').append('<td>页面显示成功率</td>');
					$('#appStoreProportionZs2').append('<td>商店500Kbps以下占比</td>');
					$('#instantMessengerSuccessZs2').append('<td>即时通信响应成功率</td>');
					$('#instantMessengerDelayZs2').append('<td>即时通信响应平均时延(ms)</td>');
					$('#browseAppPageDisplayLowZs2').append('<td>网页显示5s以上占比</td>');
					$('#browseAppPageDisplayAvgZs2').append('<td>网页显示平均时长(s)</td>');
					$('#videoSuccessZs2').append('<td>视频访问成功率</td>');
					$('#videoDelayZs2').append('<td>视频业务响应时延(ms)</td>');
					$('#gameSuccessZs2').append('<td>游戏业务访问成功率</td>');
					$('#gameDelayZs2').append('<td>游戏业务响应时延(ms)</td>');
					$('#browseSuccessZs2').append('<td>浏览业务访问成功率</td>');
					$('#browseDelayZs2').append('<td>浏览业务响应时延(ms)</td>');
					$('.indicatorsZs').append('<th>指标</th>');
					$('#downloadRateZs').append('<td>500K下载速率(Mbps)</td>');
					$('#httpDelayZs').append('<td>HTTP响应时延(ms)</td>');
					$('#webpageSuccessRateZs').append('<td>页面显示成功率</td>');
					$('#appStoreProportionZs').append('<td>商店500Kbps以下占比</td>');
					$('#instantMessengerSuccessZs').append('<td>即时通信响应成功率</td>');
					$('#instantMessengerDelayZs').append('<td>即时通信响应平均时延(ms)</td>');
					$('#browseAppPageDisplayLowZs').append('<td>网页显示5s以上占比</td>');
					$('#browseAppPageDisplayAvgZs').append('<td>网页显示平均时长(s)</td>');
					$('#videoSuccessZs').append('<td>视频访问成功率</td>');
					$('#videoDelayZs').append('<td>视频业务响应时延(ms)</td>');
					$('#gameSuccessZs').append('<td>游戏业务访问成功率</td>');
					$('#gameDelayZs').append('<td>游戏业务响应时延(ms)</td>');
					$('#browseSuccessZs').append('<td>浏览业务访问成功率</td>');
					$('#browseDelayZs').append('<td>浏览业务响应时延(ms)</td>');
					for (let i = 0; i < data.length; i++) {
						if (i < 8) {
							$('.indicatorsZs1').append('<th>' + data[i].coverArea + '</th>');
							$('#downloadRateZs1').append('<td>' + data[i].rate + '</td>');
							$('#httpDelayZs1').append('<td>' + data[i].delay + '</td>');
							$('#webpageSuccessRateZs1').append('<td>' + data[i].pageDisplaySuccessRate + '%</td>');
							$('#appStoreProportionZs1').append('<td>' + data[i].appStoreDlRate500KbRatio + '%</td>');
							$('#instantMessengerSuccessZs1').append('<td>' + data[i].instantMessageSuccessRate + '%</td>');
							$('#instantMessengerDelayZs1').append('<td>' + data[i].instantMessageResponseDelay + '</td>');
							$('#browseAppPageDisplayLowZs1').append('<td>' + data[i].pageDisplayDurationRatio + '%</td>');
							$('#browseAppPageDisplayAvgZs1').append('<td>' + data[i].pageDisplayAvgDuration + '</td>');
							$('#videoSuccessZs1').append('<td>' + data[i].videoResponseSuccessRate + '%</td>');
							$('#videoDelayZs1').append('<td>' + data[i].videoResponseAvgDelay + '</td>');
							$('#gameSuccessZs1').append('<td>' + data[i].gameResponseSuccessRate + '%</td>');
							$('#gameDelayZs1').append('<td>' + data[i].gameResponseAvgDelay + '</td>');
							$('#browseSuccessZs1').append('<td>' + data[i].browseAppSuccessRate + '%</td>');
							$('#browseDelayZs1').append('<td>' + data[i].browseAppResponseDelay + '</td>');
						} else if (i < 16) {
							$('.indicatorsZs2').append('<th>' + data[i].coverArea + '</th>');
							$('#downloadRateZs2').append('<td>' + data[i].rate + '</td>');
							$('#httpDelayZs2').append('<td>' + data[i].delay + '</td>');
							$('#webpageSuccessRateZs2').append('<td>' + data[i].pageDisplaySuccessRate + '%</td>');
							$('#appStoreProportionZs2').append('<td>' + data[i].appStoreDlRate500KbRatio + '%</td>');
							$('#instantMessengerSuccessZs2').append('<td>' + data[i].instantMessageSuccessRate + '%</td>');
							$('#instantMessengerDelayZs2').append('<td>' + data[i].instantMessageResponseDelay + '</td>');
							$('#browseAppPageDisplayLowZs2').append('<td>' + data[i].pageDisplayDurationRatio + '%</td>');
							$('#browseAppPageDisplayAvgZs2').append('<td>' + data[i].pageDisplayAvgDuration + '</td>');
							$('#videoSuccessZs2').append('<td>' + data[i].videoResponseSuccessRate + '%</td>');
							$('#videoDelayZs2').append('<td>' + data[i].videoResponseAvgDelay + '</td>');
							$('#gameSuccessZs2').append('<td>' + data[i].gameResponseSuccessRate + '%</td>');
							$('#gameDelayZs2').append('<td>' + data[i].gameResponseAvgDelay + '</td>');
							$('#browseSuccessZs2').append('<td>' + data[i].browseAppSuccessRate + '%</td>');
							$('#browseDelayZs2').append('<td>' + data[i].browseAppResponseDelay + '</td>');
						} else {
							$('.indicatorsZs').append('<th>' + data[i].coverArea + '</th>');
							$('#downloadRateZs').append('<td>' + data[i].rate + '</td>');
							$('#httpDelayZs').append('<td>' + data[i].delay + '</td>');
							$('#webpageSuccessRateZs').append('<td>' + data[i].pageDisplaySuccessRate + '%</td>');
							$('#appStoreProportionZs').append('<td>' + data[i].appStoreDlRate500KbRatio + '%</td>');
							$('#instantMessengerSuccessZs').append('<td>' + data[i].instantMessageSuccessRate + '%</td>');
							$('#instantMessengerDelayZs').append('<td>' + data[i].instantMessageResponseDelay + '</td>');
							$('#browseAppPageDisplayLowZs').append('<td>' + data[i].pageDisplayDurationRatio + '%</td>');
							$('#browseAppPageDisplayAvgZs').append('<td>' + data[i].pageDisplayAvgDuration + '</td>');
							$('#videoSuccessZs').append('<td>' + data[i].videoResponseSuccessRate + '%</td>');
							$('#videoDelayZs').append('<td>' + data[i].videoResponseAvgDelay + '</td>');
							$('#gameSuccessZs').append('<td>' + data[i].gameResponseSuccessRate + '%</td>');
							$('#gameDelayZs').append('<td>' + data[i].gameResponseAvgDelay + '</td>');
							$('#browseSuccessZs').append('<td>' + data[i].browseAppSuccessRate + '%</td>');
							$('#browseDelayZs').append('<td>' + data[i].browseAppResponseDelay + '</td>');
						}
					}
				}
				else if ($scope.logingOfCity === 'zhuhai') {
					/**清空数据*/
					$('#zhTable').find('table').find('tbody').find('td').remove();
					$('#zhTable').find('table').find('thead').find('th').remove();
					/** 指标名称 */
					$('.indicatorsZH').append('<th>指标</th>');
					$('#downloadRateZH').append('<td>500K下载速率(Mbps)</td>');
					$('#httpDelayZH').append('<td>HTTP响应时延(ms)</td>');
					$('#webpageSuccessRateZH').append('<td>页面显示成功率</td>');
					$('#appStoreProportionZH').append('<td>商店500Kbps以下占比</td>');
					$('#instantMessengerSuccessZH').append('<td>即时通信响应成功率</td>');
					$('#instantMessengerDelayZH').append('<td>即时通信响应平均时延(ms)</td>');
					$('#browseAppPageDisplayLowZH').append('<td>网页显示5s以上占比</td>');
					$('#browseAppPageDisplayAvgZH').append('<td>网页显示平均时长(s)</td>');
					$('#videoSuccessZH').append('<td>视频访问成功率</td>');
					$('#videoDelayZH').append('<td>视频业务响应时延(ms)</td>');
					$('#gameSuccessZH').append('<td>游戏业务访问成功率</td>');
					$('#gameDelayZH').append('<td>游戏业务响应时延(ms)</td>');
					$('#browseSuccessZH').append('<td>浏览业务访问成功率</td>');
					$('#browseDelayZH').append('<td>浏览业务响应时延(ms)</td>');
					for (let i = 0; i < data.length; i++) {
						$('.indicatorsZH').append('<th>' + data[i].coverArea + '</th>');
						$('#downloadRateZH').append('<td>' + data[i].rate + '</td>');
						$('#httpDelayZH').append('<td>' + data[i].delay + '</td>');
						$('#webpageSuccessRateZH').append('<td>' + data[i].pageDisplaySuccessRate + '%</td>');
						$('#appStoreProportionZH').append('<td>' + data[i].appStoreDlRate500KbRatio + '%</td>');
						$('#instantMessengerSuccessZH').append('<td>' + data[i].instantMessageSuccessRate + '%</td>');
						$('#instantMessengerDelayZH').append('<td>' + data[i].instantMessageResponseDelay + '</td>');
						$('#browseAppPageDisplayLowZH').append('<td>' + data[i].pageDisplayDurationRatio + '%</td>');
						$('#browseAppPageDisplayAvgZH').append('<td>' + data[i].pageDisplayAvgDuration + '</td>');
						$('#videoSuccessZH').append('<td>' + data[i].videoResponseSuccessRate + '%</td>');
						$('#videoDelayZH').append('<td>' + data[i].videoResponseAvgDelay + '</td>');
						$('#gameSuccessZH').append('<td>' + data[i].gameResponseSuccessRate + '%</td>');
						$('#gameDelayZH').append('<td>' + data[i].gameResponseAvgDelay + '</td>');
						$('#browseSuccessZH').append('<td>' + data[i].browseAppSuccessRate + '%</td>');
						$('#browseDelayZH').append('<td>' + data[i].browseAppResponseDelay + '</td>');
					}
				}
				else if ($scope.logingOfCity === 'maoming'){
					/**清空数据*/
					$('#mmTable').find('table').find('tbody').find('td').remove();
					$('#mmTable').find('table').find('thead').find('th').remove();
					/** 指标名称 */
					$('.indicatorsMM').append('<th>指标</th>');
					$('#downloadRateMM').append('<td>500K下载速率(Mbps)</td>');
					$('#httpDelayMM').append('<td>HTTP响应时延(ms)</td>');
					$('#webpageSuccessRateMM').append('<td>页面显示成功率</td>');
					$('#appStoreProportionMM').append('<td>商店500Kbps以下占比</td>');
					$('#instantMessengerSuccessMM').append('<td>即时通信响应成功率</td>');
					$('#instantMessengerDelayMM').append('<td>即时通信响应平均时延(ms)</td>');
					$('#browseAppPageDisplayLowMM').append('<td>网页显示5s以上占比</td>');
					$('#browseAppPageDisplayAvgMM').append('<td>网页显示平均时长(s)</td>');
					$('#videoSuccessMM').append('<td>视频访问成功率</td>');
					$('#videoDelayMM').append('<td>视频业务响应时延(ms)</td>');
					$('#gameSuccessMM').append('<td>游戏业务访问成功率</td>');
					$('#gameDelayMM').append('<td>游戏业务响应时延(ms)</td>');
					$('#browseSuccessMM').append('<td>浏览业务访问成功率</td>');
					$('#browseDelayMM').append('<td>浏览业务响应时延(ms)</td>');
					for (let i = 0; i < data.length; i++) {
						$('.indicatorsMM').append('<th>' + data[i].coverArea + '</th>');
						$('#downloadRateMM').append('<td>' + data[i].rate + '</td>');
						$('#httpDelayMM').append('<td>' + data[i].delay + '</td>');
						$('#webpageSuccessRateMM').append('<td>' + data[i].pageDisplaySuccessRate + '%</td>');
						$('#appStoreProportionMM').append('<td>' + data[i].appStoreDlRate500KbRatio + '%</td>');
						$('#instantMessengerSuccessMM').append('<td>' + data[i].instantMessageSuccessRate + '%</td>');
						$('#instantMessengerDelayMM').append('<td>' + data[i].instantMessageResponseDelay + '</td>');
						$('#browseAppPageDisplayLowMM').append('<td>' + data[i].pageDisplayDurationRatio + '%</td>');
						$('#browseAppPageDisplayAvgMM').append('<td>' + data[i].pageDisplayAvgDuration + '</td>');
						$('#videoSuccessMM').append('<td>' + data[i].videoResponseSuccessRate + '%</td>');
						$('#videoDelayMM').append('<td>' + data[i].videoResponseAvgDelay + '</td>');
						$('#gameSuccessMM').append('<td>' + data[i].gameResponseSuccessRate + '%</td>');
						$('#gameDelayMM').append('<td>' + data[i].gameResponseAvgDelay + '</td>');
						$('#browseSuccessMM').append('<td>' + data[i].browseAppSuccessRate + '%</td>');
						$('#browseDelayMM').append('<td>' + data[i].browseAppResponseDelay + '</td>');
					}
				}
			});

			let uploadedDataURL = '';
			if ($scope.logingOfCity === 'huizhou') {
				uploadedDataURL = 'asserts/maps/huizhouMap.json';
			} else if ($scope.logingOfCity === 'chaozhou') {
				uploadedDataURL = 'asserts/maps/CHAOZHOU.json';
			} else if ($scope.logingOfCity === 'shaoguan') {
				uploadedDataURL = 'asserts/maps/shaoguanMap.json';
			} else if ($scope.logingOfCity === 'zhongshan') {
				uploadedDataURL = 'asserts/maps/zhongshanMap.json';
			} else if ($scope.logingOfCity === 'zhuhai') {
				uploadedDataURL = 'asserts/maps/zhuhai.json';
			} else if ($scope.logingOfCity === 'maoming') {
				uploadedDataURL = 'asserts/maps/maoming.json';
			}
			let mapChart = echarts.getInstanceByDom(document.getElementById('huizhouMap'));
			if (isInitialize) {
				mapChart.showLoading(loadingStyle);
			}
			HttpRequestService.get(url2, param, data => {
				//console.log(data);
				let subscriberData = [];
				let subscriber4GData = [];
				let subscriber2G3GData = [];
				let flowData = [];
				for (let i = 0; i < data.length; i++) {
					subscriberData.push({
						name: data[i].coverArea,
						value: (data[i].subscriberCount / 10000).toFixed(2),
					});
					subscriber4GData.push({
						name: data[i].coverArea,
						value: (data[i].subscriberCount4G / 10000).toFixed(2),
					});
					subscriber2G3GData.push({
						name: data[i].coverArea,
						value: (data[i].subscriberCount2G3G / 10000).toFixed(2),
					});
					flowData.push({
						name: data[i].coverArea,
						value: (data[i].flow / 1024).toFixed(2),
					});
				}
				// console.log(subscriberData);
				// console.log(flowData);

				/**加载地图的json文件*/
				$.get(uploadedDataURL, function (huizhouJson) {
					echarts.registerMap('惠州', huizhouJson);
					let option = {
						backgroundColor: '#ffffff',
						title: {
							show: false,
							text: '惠州地图',
							subtext: '时间周期：2017.01.01——2017.06.30',
							left: '50%',
							textStyle: {
								color: '#000',
							},
						},
						tooltip: {
							trigger: 'item',
							//formatter: '{b}<br/>区域内用户数: {c}人<br/>流量: 235GB'
							formatter: function (params) {
								//定义一个res变量来保存最终返回的字符结果,并且先把地区名称放到里面
								let res = params.name + '<br />';
								let unit = '';
								//定义一个变量来保存series数据系列
								let myseries = option.series;
								//循环遍历series数据系列
								for (let i = 0; i < myseries.length; i++) {
									//在内部继续循环series[i],从data中判断：当地区名称等于params.name的时候就将当前数据和名称添加到res中供显示
									for (let k = 0; k < myseries[i].data.length; k++) {
										//console.log(myseries[i].data[k].name);
										//如果data数据中的name和地区名称一样
										if (myseries[i].data[k].name === params.name) {
											if (i === 3) {
												unit = 'TB'
											}
											else {
												unit = '万人'
											}
											//将series数据系列每一项中的name和数据系列中当前地区的数据添加到res中
											res += myseries[i].name + '：' + myseries[i].data[k].value + unit + '<br />';
										}
									}
								}
								//返回res
								//console.log(res);
								return res;
							},
						},
						/*visualMap: {
						 type: 'continuous',
						 show: false,
						 min: 100000,
						 max: 560000,
						 left: 'left',
						 top: 'bottom',
						 text: ['高', '低'], // 文本，默认为数值文本
						 calculable: true,
						 inRange: {
						 color: ['#FCFBDC', '#FFBF44', '#FF6503'],
						 //color: ['#8FCFFF','#41B0FF','#1A92FF']
						 },
						 },*/
						series: [{
							type: 'map',
							name: '区域内总用户数',
							map: '惠州',
							aspectScale: 1.2,
							layoutCenter: ['50%', '50%'],
							// 如果宽高比大于 1 则宽度为 100，如果小于 1 则高度为 100，保证了不超过 100x100 的区域
							layoutSize: '130%',
							itemStyle: {
								normal: {
									label: {
										show: true,
									},
									borderColor: '#FFC03D',
									areaColor: '#fff',
									color: function (params) {
										// build a color map as your need.
										let colorList = [
											'#E63638', '#07B4F6', '#AEC902', '#7C58EC', '#FEC832', '#F9009C', '#FE8C10',
											'#AEC902', '#FEC832', '#F9009C', '#7C58EC', '#E63638', '#07B4F6', '#AEC902',
											'#7C58EC', '#E63638', '#07B4F6', '#AEC902', '#FEC832', '#FE8C10', '#F9009C',
											'#FEC832', '#07b4f6', '#7C58EC', '#E63638', '#07B4F6', '#AEC902', '#FE8C10',
											'#E63638',
										];
										return colorList[params.dataIndex]
									},
								},

								emphasis: {
									label: {
										show: true,
									},
									areaColor: '#AB6CF3',
									borderWidth: 0,
								},
							},
							data: subscriberData,
						},
						{
							type: 'map',
							name: '区域内4G用户数',
							map: '惠州',
							aspectScale: 1.2,
							layoutCenter: ['50%', '50%'],
							// 如果宽高比大于 1 则宽度为 100，如果小于 1 则高度为 100，保证了不超过 100x100 的区域
							layoutSize: 500,
							itemStyle: {
								normal: {
									label: {
										show: true,
									},
									borderColor: '#389BB7',
									areaColor: '#fff',
								},
								emphasis: {
									label: {
										show: true,
									},
									areaColor: '#41B0FF',
									borderWidth: 0,
								},
							},
							data: subscriber4GData,
						},
						{
							type: 'map',
							name: '区域内2/3G用户数',
							map: '惠州',
							aspectScale: 1.2,
							layoutCenter: ['50%', '50%'],
							// 如果宽高比大于 1 则宽度为 100，如果小于 1 则高度为 100，保证了不超过 100x100 的区域
							layoutSize: 500,
							itemStyle: {
								normal: {
									label: {
										show: true,
									},
									borderColor: '#389BB7',
									areaColor: '#fff',
								},
								emphasis: {
									label: {
										show: true,
									},
									areaColor: '#41B0FF',
									borderWidth: 0,
								},
							},
							data: subscriber2G3GData,
						},
						{
							type: 'map',
							name: '流量',
							map: '惠州',
							aspectScale: 1.2,
							layoutCenter: ['50%', '50%'],
							// 如果宽高比大于 1 则宽度为 100，如果小于 1 则高度为 100，保证了不超过 100x100 的区域
							layoutSize: 500,
							itemStyle: {
								normal: {
									label: {
										show: true,
									},
									borderColor: '#389BB7',
									areaColor: '#fff',
								},
								emphasis: {
									label: {
										show: true,
									},
									areaColor: '#41B0FF',
									borderWidth: 0,
								},
							},
							data: flowData,
						}],

					};
					if ($scope.logingOfCity === 'huizhou') {
						//惠州
						switch (screenWidth) {
							case 1400:
								option.series[0].layoutSize = '104%';
								option.series[0].aspectScale = 0.85;
								break;
							case 1440:
								option.series[0].layoutSize = '109%';
								option.series[0].aspectScale = 1.0;
								break;
							case 1600:
								option.series[0].layoutSize = '120%';
								option.series[0].aspectScale = 1.1;
								break;
							case 1680:
								option.series[0].layoutSize = '102%';
								option.series[0].aspectScale = 0.95;
								break;
							case 1920:
								option.series[0].layoutSize = '110%';
								option.series[0].aspectScale = 1.0;
								break;
							default:
								break;
						}
					}
					else if ($scope.logingOfCity === 'chaozhou') {
						//潮州
						switch (screenWidth) {
							case 1366:
								option.series[0].layoutSize = '110%';
								option.series[0].aspectScale = 1.15;
								break;
							case 1400:
							case 1440:
								option.series[0].layoutSize = '100%';
								option.series[0].aspectScale = 1.1;
								break;
							case 1600:
								option.series[0].layoutSize = '105%';
								option.series[0].aspectScale = 1.1;
								break;
							case 1680:
								option.series[0].layoutSize = '102%';
								option.series[0].aspectScale = 1.15;
								break;
							case 1920:
								option.series[0].layoutSize = '105%';
								option.series[0].aspectScale = 1.15;
								break;
							default:
								break;
						}
					}
					else if ($scope.logingOfCity === 'shaoguan') {
						//韶关
						switch (screenWidth) {
							case 1366:
								option.series[0].layoutSize = '115%';
								option.series[0].aspectScale = 1.2;
								option.series[0].layoutCenter = ['48%', '54%'];
								break;
							case 1400:
								option.series[0].layoutSize = '100%';
								option.series[0].aspectScale = 1;
								break;
							case 1440:
								option.series[0].layoutSize = '100%';
								option.series[0].aspectScale = 1.1;
								break;
							case 1600:
								option.series[0].layoutSize = '105%';
								option.series[0].aspectScale = 1.15;
								break;
							case 1680:
								option.series[0].layoutSize = '101%';
								option.series[0].aspectScale = 1.1;
								break;
							case 1920:
								option.series[0].layoutSize = '105%';
								option.series[0].aspectScale = 1.15;
								break;
							default:
								break;
						}
					}
					else if ($scope.logingOfCity === 'zhongshan') {
						//中山
						switch (screenWidth) {
							case 1366:
								option.series[0].layoutSize = '96%';
								option.series[0].aspectScale = 1.2;
								break;
							case 1400:
								option.series[0].layoutSize = '105%';
								option.series[0].aspectScale = 1.05;
								break;
							case 1440:
								option.series[0].layoutSize = '96%';
								option.series[0].aspectScale = 1.15;
								break;
							case 1600:
								option.series[0].layoutSize = '100%';
								option.series[0].aspectScale = 1.25;
								break;
							case 1680:
								option.series[0].layoutSize = '95%';
								option.series[0].aspectScale = 1.1;
								break;
							case 1920:
								option.series[0].layoutSize = '96%';
								option.series[0].aspectScale = 1.18;
								break;
							default:
								break;
						}
					}
					else if ($scope.logingOfCity === 'zhuhai') {
						option.series[0].layoutCenter = ['85%', '60%'];

						//珠海
						switch (screenWidth) {
							case 1366:
								option.series[0].layoutSize = '190%';
								option.series[0].aspectScale = 1.2;
								break;
							case 1400:
								option.series[0].layoutSize = '195%';
								option.series[0].aspectScale = 1.3;
								break;
							case 1440:
								option.series[0].layoutSize = '180%';
								option.series[0].aspectScale = 1.7;
								break;
							case 1600:
								option.series[0].layoutSize = '170%';
								option.series[0].aspectScale = 1.65;
								break;
							case 1680:
								option.series[0].layoutSize = '160%';
								option.series[0].aspectScale = 1.6;
								break;
							case 1920:
								option.series[0].layoutSize = '150%';
								option.series[0].aspectScale = 1.55;
								break;
							default:
								break;
						}
					}
					else if ($scope.logingOfCity === 'maoming') {
						//茂名
						switch (screenWidth) {
							case 1366:
								option.series[0].layoutSize = '100%';
								break;
							case 1400:
								option.series[0].layoutSize = '104%';
								option.series[0].aspectScale = 0.85;
								break;
							case 1440:
								option.series[0].layoutSize = '109%';
								option.series[0].aspectScale = 1.0;
								break;
							case 1600:
								option.series[0].layoutSize = '120%';
								option.series[0].aspectScale = 1.1;
								break;
							case 1680:
								option.series[0].layoutSize = '102%';
								option.series[0].aspectScale = 0.95;
								break;
							case 1920:
								option.series[0].layoutSize = '110%';
								option.series[0].aspectScale = 1.0;
								break;
							default:
								break;
						}
					}

					mapChart.setOption(option);
				});
				if (isInitialize) {
					mapChart.hideLoading();
				}
				timer = setInterval(() => itemSwitch(), 10000);//加载完最后的资源后开启轮播计时器
			}, () => {
				if (isInitialize) {
					mapChart.hideLoading();
				}
			});
		},
	};

	/**因为点击用户数和流量需要排序，所以把这个双向柱形图提取出来*/
	const getTwoBarAnalysis = (isInitialize, loadingStyle) => {
		let url2 = APIS.index.businessDistributionBar;
		/*let url2 = 'http://192.168.5.27:8080/gempile-rs-gis/v1.4/hz/homePage/appSubTypeFlowAndSubscribers'*/
		let chart3 = echarts.getInstanceByDom(document.getElementById('twoWayBarChart'));
		/*let apps = ['腾讯视频', '优酷网', '芒果TV', '爱奇艺', '微信', 'QQ', 'UC网站浏览', '腾讯网', '网易网', '百度'];
		 let subscribers = [139.25, 132, 124, 120, 185.67, 177.23, 168.79, 160, 151, 166.68];
		 let flow = [882.24, 714, 504, 482, 336, 273, 252, 231, 218, 210];*/
		if (isInitialize) {
			chart3.showLoading(loadingStyle);
		}
		HttpRequestService.get(url2, {
			timeSlot: beforeNowDate(),
			rankCondition: twoBarRank,
			cityOid: cityId,
			pageIndex: $scope.pageNum,
			pageSize: 10,
		}, data => {
			pageCount = Math.ceil(data.totalCount / 10);
			let apps = [];
			let appShow = [];
			let subscribers = [];
			let flow = [];
			for (let i = 0, len = data.result.length; i < len; i++) {
				apps.push(data.result[i].appSubTypeName);
				appShow.push(data.result[i].appSubTypeName.substring(0, 5));
				subscribers.push((data.result[i].userCount / 10000).toFixed(2));
				flow.push((data.result[i].flow / 1024).toFixed(2));
			}
			let EChartsOption3 = {
				baseOption: {
					backgroundColor: '#fff',
					title: {
						show: false,
					},
					legend: {
						show: false,
						data: [
							{
								name: '用户数',
								textStyle: {
									// fontSize:12,
									// fontWeight:'bolder',
									// color:'#cccccc'
									align: 'right',
								},
								//icon:'stack'
							},
							{
								name: '流量',
								textStyle: {
									align: 'left',
									// fontSize:12,
									// fontWeight:'bolder',
									// color:'#df3434'
								},
								//icon:'pie'
							}],
						itemGap: 75,
						top: -4,
						left: 104,
						textStyle: {
							//color: '#fff',
						},
					},
					tooltip: {
						show: true,
						trigger: 'item',
						formatter: function (params) {
							let res;
							if (params.seriesIndex === 0) {
								res = apps[params.dataIndex] + '<br/>' + params.seriesName + ': ' + params.data + '万人';
							}
							else {
								res = apps[params.dataIndex] + '<br/>' + params.seriesName + ': ' + params.data + 'TB';
							}
							return res;
						},
						axisPointer: {
							type: 'shadow',
						},
					},
					toolbox: {
						show: false,
					},
					grid: [{
						show: false,
						left: '8%',
						top: -25,
						bottom: 5,
						containLabel: true,
						width: '52%',
					}, {
						show: false,
						left: '52%',
						top: -3,
						bottom: 5,
						width: '0%',
					}, {
						show: false,
						right: '8%',
						top: -25,
						bottom: 5,
						containLabel: true,
						width: '52%',
					}],
					xAxis: [{
						type: 'value',
						inverse: true,
						axisLine: {
							show: false,
						},
						axisTick: {
							show: false,
						},
						position: 'top',
						axisLabel: {
							show: false,
							textStyle: {
								color: '#B2B2B2',
								fontSize: 12,
							},
						},
						splitLine: {
							show: false,
						},
					}, {
						gridIndex: 1,
						show: false,
					}, {
						gridIndex: 2,
						type: 'value',
						axisLine: {
							show: false,
						},
						axisTick: {
							show: false,
						},
						position: 'top',
						axisLabel: {
							show: false,
							textStyle: {
								color: '#B2B2B2',
								fontSize: 12,
							},
						},
						splitLine: {
							show: false,
						},
					}],
					yAxis: [{
						type: 'category',
						inverse: true,
						position: 'right',
						axisLine: {
							show: false,
						},
						axisTick: {
							show: false,
						},
						axisLabel: {
							show: false,
							margin: 8,
							textStyle: {
								color: '#9D9EA0',
								fontSize: 12,
							},
						},
						data: appShow,
					}, {
						gridIndex: 1,
						type: 'category',
						inverse: true,
						position: 'left',
						axisLine: {
							show: false,
						},
						axisTick: {
							show: false,
						},
						axisLabel: {
							show: true,
							textStyle: {
								color: '#545454',
								fontSize: 12,
							},

						},
						/*eslint prefer-arrow-callback: ["error", { "allowNamedFunctions": true }]*/
						data: apps.map(function (value) {
							return {
								value: value.substring(0, 5),
								textStyle: {
									align: 'center',
								},
							}
						}),
					}, {
						gridIndex: 2,
						type: 'category',
						inverse: true,
						position: 'left',
						axisLine: {
							show: false,
						},
						axisTick: {
							show: false,
						},
						axisLabel: {
							show: false,
							textStyle: {
								color: '#9D9EA0',
								fontSize: 12,
							},

						},
						data: appShow,
					}],
					series: [
						{
							name: '用户数',
							type: 'bar',
							barGap: 5,
							barWidth: 17,
							label: {
								normal: {
									show: true,
									position: 'left',
									distance: 3,
								},
								emphasis: {
									show: true,
									position: 'left',
									offset: [0, 0],
									/*textStyle: {
									 //color: '#fff',
									 fontSize: 14,
									 },*/
								},
							},
							itemStyle: {
								normal: {
									color: '#FF9933',
									barBorderRadius: [5, 5, 5, 5],
								},
								emphasis: {
									color: '#F5AD6A',
								},
							},
							data: subscribers,
						},

						{
							name: '流量',
							type: 'bar',
							barGap: 5,
							barWidth: 17,
							xAxisIndex: 2,
							yAxisIndex: 2,
							label: {
								normal: {
									show: true,
									position: 'right',
									distance: 3,
								},
								emphasis: {
									show: true,
									position: 'right',
									offset: [0, 0],
									/*textStyle: {
									 //color: '#fff',
									 fontSize: 14,

									 },*/
								},
							},
							itemStyle: {
								normal: {
									color: '#33CCFF',
									barBorderRadius: [5, 5, 5, 5],
								},
								emphasis: {
									color: '#6AD1F5',
								},
							},
							data: flow,
						},
					],
				},
			};
			switch (screenWidth) {
				case 1400:
				case 1440:
					EChartsOption3.baseOption.grid[0].left = '7%';
					EChartsOption3.baseOption.grid[2].right = '7%';
					break;
				case 1600:
				case 1680:
					EChartsOption3.baseOption.grid[0].left = '6%';
					EChartsOption3.baseOption.grid[2].right = '6%';
					break;
				case 1920:
					EChartsOption3.baseOption.grid[0].left = '4%';
					EChartsOption3.baseOption.grid[1].left = '51%';
					EChartsOption3.baseOption.grid[2].right = '5%';
					break;
				default:
					break;
			}
			chart3.setOption(EChartsOption3);
			if (isInitialize) {
				chart3.hideLoading();
			}
		}, () => {
			if (isInitialize) {
				chart3.hideLoading();
			}
		});
	}

	/**双向柱形图点击按钮排行*/
	$('#getSubscriberToRank').click((isInitialize, loadingStyle) => {
		twoBarRank = 1;
		$scope.pageNum = 1;
		getTwoBarAnalysis(isInitialize, loadingStyle);
	})
	$('#getFlowToRank').click((isInitialize, loadingStyle) => {
		twoBarRank = 2;
		$scope.pageNum = 1;
		getTwoBarAnalysis(isInitialize, loadingStyle);
	})

	/******双向柱形图翻页按钮   start     *****************************/
	/**设置按钮样式*/
	let setPreAndFirstBtn = () => {
		$('.first-page').addClass('ui-disabled').attr('disabled', true);
		$('.pre-page').addClass('ui-disabled').attr('disabled', true);
		$('.next-page').removeClass('ui-disabled').attr('disabled', false);
		$('.last-page').removeClass('ui-disabled').attr('disabled', false);
	};
	let setNextAndLastBtn = () => {
		$('.first-page').removeClass('ui-disabled').attr('disabled', false);
		$('.pre-page').removeClass('ui-disabled').attr('disabled', false);
		$('.next-page').addClass('ui-disabled').attr('disabled', true);
		$('.last-page').addClass('ui-disabled').attr('disabled', true);
	};
	let setAllBtn = () => {
		$('.first-page').removeClass('ui-disabled').attr('disabled', false);
		$('.pre-page').removeClass('ui-disabled').attr('disabled', false);
		$('.next-page').removeClass('ui-disabled').attr('disabled', false);
		$('.last-page').removeClass('ui-disabled').attr('disabled', false);
	};

	/**点击第一页*/
	$('.first-page').click((isInitialize, loadingStyle) => {
		$scope.pageNum = 1;
		setPreAndFirstBtn();
		getTwoBarAnalysis(isInitialize, loadingStyle);
	});

	/**点击上一页*/
	$('.pre-page').click((isInitialize, loadingStyle) => {
		if ($scope.pageNum <= 1) {
			$scope.pageNum = 1;
		}
		else {
			$scope.pageNum--;
			getTwoBarAnalysis(isInitialize, loadingStyle);
			setAllBtn();
		}
		if ($scope.pageNum === 1) {
			setPreAndFirstBtn();
		}
	});

	/**点击下一页*/
	$('.next-page').click((isInitialize, loadingStyle) => {
		if ($scope.pageNum >= pageCount) {
			$scope.pageNum = pageCount;
		} else {
			setAllBtn();
			$scope.pageNum++;
			getTwoBarAnalysis(isInitialize, loadingStyle);
		}
		if ($scope.pageNum === pageCount) {
			setNextAndLastBtn();
		}
	});

	/**点击最后一页*/
	$('.last-page').click((isInitialize, loadingStyle) => {
		$scope.pageNum = pageCount;
		setNextAndLastBtn();
		getTwoBarAnalysis(isInitialize, loadingStyle);
	});

	/**点击go按钮*/
	$('.go').click((isInitialize, loadingStyle) => {
		let re = /^[1-9]\d*$/; //判断是不是正整数
		if (!re.test($scope.pageNum)) {
			$scope.pageNum = 1;
			setPreAndFirstBtn();
		}
		if ($scope.pageNum > pageCount) {
			$scope.pageNum = pageCount;
			setNextAndLastBtn();
		}
		getTwoBarAnalysis(isInitialize, loadingStyle);
	});

	/******双向柱形图翻页按钮   end     ********************************/

	/** 考核指标与Volte指标页面切换 */
	$scope.switchAssessmentAndVolte = pageId => {
		//$("#assessmentPanel").carousel('next');
		if (pageId === 1 && $scope.pageSelect === 2) {
			$('#assessmentPanel').carousel('prev');
		}
		else if (pageId === 2 && $scope.pageSelect === 1) {
			$('#assessmentPanel').carousel('next');
		}
	};

	/** 模拟点击屏幕以刷新双向绑定 */
	$scope.simulateClick = () => {
		//console.log('轮播');
		//return;
	};

	/** 网元速率柱状图切换页面 */
	$scope.switchNERview = chartId => {
		//$scope.networkChartPageNumber = chartId;
		//$('#networkElementChartPanel').carousel('next');
		if (chartId === 1 && $scope.networkChartPageNumber === 1) {
			$('#networkElementChartPanel').carousel('prev');
		}
		else if (chartId === 2 && $scope.networkChartPageNumber === 2) {
			$('#networkElementChartPanel').carousel('next');
		}
		else if (chartId === 3 && $scope.networkChartPageNumber === 3) {
			$('#networkElementChartPanel').carousel('next');
		}
		else if (chartId === 4 && $scope.networkChartPageNumber === 4) {
			$('#networkElementChartPanel').carousel('next');
		}
	};

	/** 查询表格切换页面 */
	// $scope.switchTable = pageId => {
	//     $scope.tablePageNumber = pageId;
	// };

	/**获取数组中的最大值*/
	Array.prototype.max = function () {
		return Math.max.apply({}, this)
	};

	/** 监听鼠标位置是否处于页面顶端,从而隐藏与显示顶部导航栏 */
	/*$(function () {
	 $('#homePageNewModule').mousemove(function (e) {
	 //e = e || window.event;
	 scrollTop = e.pageY || e.clientY + document.body.scrollTop;
	 if (browserIsInitialize) {
	 if (scrollTop <= 65) {
	 browserIsInitialize = false;
	 }
	 }
	 else if ($rootScope.showTopNavigator && scrollTop > 65) {
	 $rootScope.showTopNavigator = false;
	 }
	 else if (!$rootScope.showTopNavigator && scrollTop <= 10) {
	 $rootScope.showTopNavigator = true;
	 }
	 });
	 });*/

	/**屏幕自适应 ——浏览器大小改变时重置表格大小*/
	$(window).resize(() => {
		let AssementChart1 = echarts.getInstanceByDom(document.getElementById('apChart1'));
		let AssementChart2 = echarts.getInstanceByDom(document.getElementById('apChart2'));
		let AssementChart3 = echarts.getInstanceByDom(document.getElementById('apChart3'));
		let AssementChart4 = echarts.getInstanceByDom(document.getElementById('apChart4'));
		let nerChart1 = echarts.getInstanceByDom(document.getElementById('nerChart1'));
		let nerChart2 = echarts.getInstanceByDom(document.getElementById('nerChart2'));
		let nerChart3 = echarts.getInstanceByDom(document.getElementById('nerChart3'));
		let nerChart4 = echarts.getInstanceByDom(document.getElementById('nerChart4'));
		let gaugeChart1 = echarts.getInstanceByDom(document.getElementById('IMSChart'));
		let gaugeChart2 = echarts.getInstanceByDom(document.getElementById('firstCallLastChart'));
		let gaugeChart3 = echarts.getInstanceByDom(document.getElementById('firstCallSuccessChart'));
		let horizontalBarChart1 = echarts.getInstanceByDom(document.getElementById('callChart'));
		let horizontalBarChart2 = echarts.getInstanceByDom(document.getElementById('regChart'));
		//let businessPieChart1 = echarts.getInstanceByDom(document.getElementById('bpChart1'));
		//let businessPieChart2 = echarts.getInstanceByDom(document.getElementById('bpChart2'));
		let businessAreaChart = echarts.getInstanceByDom(document.getElementById('aChart'));
		let businessBarChart = echarts.getInstanceByDom(document.getElementById('twoWayBarChart'));
		let mapChart = echarts.getInstanceByDom(document.getElementById('huizhouMap'));
		let currentLeftPanel = $('#leftPanel');
		let currentLeftSideUp = $('.left-side-up');
		let currentLeftSideDown = $('.left-side-down');
		let currentRightPanel = $('#rightPanel');
		let currentMiddlePanel = $('#middlePanle');
		let currentLeftWidth = currentLeftPanel.width();
		let currentRightWidth = currentRightPanel.width();
		let currentRightHeight = currentRightPanel.height();
		let currentMiddleWidth = currentMiddlePanel.width();
		currentLeftSideDown.css('height', currentLeftPanel.height() - currentLeftSideUp.height() - (currentLeftPanel.height() * 0.01));
		// $(".left-side-down").css('margin-top' , $('#leftPanel').height() * 0.01);
		$('.networkElementRate-charts').css('width', currentLeftWidth - 5);
		$('.networkElementRate-charts').css('height', (currentLeftSideDown.height() * 0.972) - 42);
		$('.assessment-charts').css('width', currentLeftWidth / 4);
		$('.gauge-charts').css('width', currentLeftWidth / 3);
		$('.gauge-charts').css('height', (currentLeftSideUp.height() - 31) * 0.3);
		$('.horizontalBar-charts').css('width', currentLeftWidth / 2);
		$('.horizontalBar-charts').css('height', (currentLeftSideUp.height() - 31) * 0.7);
		//$('#bpChart1').css('width', currentRightWidth * 0.55);
		//$('#bpChart2').css('width', currentRightWidth * 0.45);
		//$('#bpChart1').css('height', currentRightHeight * 0.35);
		//$('#bpChart2').css('height', currentRightHeight * 0.35);
		$('#aChart').css('width', currentRightWidth);
		$('#aChart').css('height', currentRightHeight * 0.35);
		$('#twoWayBarChart').css('width', currentRightWidth);
		$('#twoWayBarChart').css('height', currentRightHeight - 60 - $('#aChart').height() - 20);
		currentMiddlePanel.css('height', currentRightPanel.height());
		$('#huizhouMap').css('width', currentMiddleWidth);
		$('#huizhouMap').css('height', currentRightPanel.height() - $('.tableMeg').height() - 30);
		let innerHeight = $(document).height();
		if ($scope.pageSelect === 1) {
			$('.progressPanel').css('height', currentLeftSideUp.height() - $('.pieChartPanel').height() - 40);
			if (innerHeight > 1000) {
				$('.progressCharts').css('padding-top', ($('.progressPanel').height() - ($('.progressCharts').height() * 5)) * 0.095);
				$('.progressCharts').css('padding-bottom', ($('.progressPanel').height() - ($('.progressCharts').height() * 5)) * 0.07);
			} else {
				$('.progressCharts').css('padding-top', ($('.progressPanel').height() - ($('.progressCharts').height() * 5)) * 0.06);
				$('.progressCharts').css('padding-bottom', ($('.progressPanel').height() - ($('.progressCharts').height() * 5)) * 0.05);
			}
		}
		AssementChart1.resize();
		AssementChart2.resize();
		AssementChart3.resize();
		AssementChart4.resize();
		nerChart1.resize();
		nerChart2.resize();
		if ($scope.networkChartPage3 == true) {
			nerChart3.resize();
		}
		if ($scope.networkChartPage4 == true) {
			nerChart4.resize();
		}
		gaugeChart1.resize();
		gaugeChart2.resize();
		gaugeChart3.resize();
		horizontalBarChart1.resize();
		horizontalBarChart2.resize();
		//businessPieChart1.resize();
		//businessPieChart2.resize();
		businessAreaChart.resize();
		businessBarChart.resize();
		mapChart.resize();
	});

	/** 资源加载完时先暂停轮播 */
	window.onload = function () {
		$('.carousel').carousel('pause');
	};

	/**页面跳转时，清除轮播定时器*/
	window.addEventListener('popstate', function () {
		$('.carousel').carousel('pause');
		clearInterval(timer);
	});

	/** 组件轮播 */
	const itemSwitch = () => {
		if (!$scope.isEnterIndicator) {
			$('#assessmentPanel').carousel('next');
		}
		if (!$scope.isEnterNetElement) {
			$('#networkElementChartPanel').carousel('next');
		}
		if (!$scope.isEnterTable) {
			$('.tableMeg').carousel('next');
		}
	};
	// const test = () => {
	//     //console.log(timer++);
	//     //$('.carousel').carousel('pause');
	// }

	/** 考核指标与VOLTE指标轮播 开始*/
	$('#assessmentPanel').on('slide.bs.carousel', function () {
		if ($scope.pageSelect === 1) {
			$scope.pageSelect = 2;
		} else {
			$scope.pageSelect = 1;
		}
	});
	/** 考核指标与VOLTE指标轮播 结束*/
	$('#assessmentPanel').on('slid.bs.carousel', function () {
		$('.left-side-up').trigger('click');
		let gaugeChart1 = echarts.getInstanceByDom(document.getElementById('IMSChart'));
		let gaugeChart2 = echarts.getInstanceByDom(document.getElementById('firstCallLastChart'));
		let gaugeChart3 = echarts.getInstanceByDom(document.getElementById('firstCallSuccessChart'));
		let horizontalBarChart1 = echarts.getInstanceByDom(document.getElementById('callChart'));
		let horizontalBarChart2 = echarts.getInstanceByDom(document.getElementById('regChart'));
		gaugeChart1.resize();
		gaugeChart2.resize();
		gaugeChart3.resize();
		horizontalBarChart1.resize();
		horizontalBarChart2.resize();
		$('.left-side-down').css('height', $('#leftPanel').height() - $('.left-side-up').height() - $('#leftPanel').height() * 0.01);
		if (browserWidth !== $(document).width()) {
			$(window).trigger('resize');
			browserWidth = $(document).width()
			//console.log('分辨率变了')
		}
		$('.carousel').carousel('pause');
	});

	$('#networkElementChartPanel').carousel();
	/** 网元速率轮播 开始 */
	$('#networkElementChartPanel').on('slide.bs.carousel', function () {
		$('#networkElementChartPanel').css('padding-top', $('.networkElementRate-charts').height());
		$('.networkElementRate-charts').css('display', 'none');
		$('.networkElementButton').attr('disabled', true);
	});
	/** 网元速率轮播 结束*/
	$('#networkElementChartPanel').on('slid.bs.carousel', function () {
		// do something…
		$('#networkElementChartPanel').css('padding-top', 0);
		$scope.networkChartPageNumber = $('#networkElementChartPanel').find('.carousel-item.active').index() + 1;
		if ($scope.networkChartPageNumber === 1) {
			$('#nerChart1').css('display', 'flex');
		}
		else if ($scope.networkChartPageNumber === 2) {
			$('#nerChart2').css('display', 'flex');
		}
		else if ($scope.networkChartPageNumber === 3) {
			$('#nerChart3').css('display', 'flex');
		}
		else {
			$('#nerChart4').css('display', 'flex');
		}

		$('.control-panels').trigger('click');
		$('.networkElementButton').attr('disabled', false);

		let nerChart2 = echarts.getInstanceByDom(document.getElementById('nerChart2'));
		nerChart2.resize();
		if ($scope.networkChartPage3 == true) {
			let nerChart3 = echarts.getInstanceByDom(document.getElementById('nerChart3'));
			nerChart3.resize();
		}
		if ($scope.networkChartPage4 == true) {
			let nerChart4 = echarts.getInstanceByDom(document.getElementById('nerChart4'));
			nerChart4.resize();
		}
		$('.carousel').carousel('pause');
	});

	/**网络概述轮播*/
	$(document).ready(() => {
		$('.tableMeg').carousel();
		/** 网络概述表格轮播 开始*/
		$('.tableMeg').on('slide.bs.carousel', function () {
			$('.tableButton').attr('disabled', true);
		});
		/** 网元概述表格轮播 结束 */
		$('.tableMeg').on('slid.bs.carousel', function () {
			$('.tableButton').attr('disabled', false);
			$('.tableButton').removeClass('Checked');
			$('.tableButton.active').addClass('Checked');
			$('.carousel').carousel('pause');
			/*$('.tableButton1').attr('disabled', false);
			 $('.tableButton2').attr('disabled', false);
			 $('.tableButton3').attr('disabled', false);
			 $('.tableButton4').attr('disabled', false);
			 $('.carousel').carousel('pause');
			 if ($('.tableButton1').hasClass('active')) {
			 $('.tableButton1').addClass('Checked');
			 $('.tableButton2').removeClass('Checked');
			 $('.tableButton3').removeClass('Checked');
			 $('.tableButton4').removeClass('Checked');
			 }
			 else if ($('.tableButton2').hasClass('active')) {
			 $('.tableButton2').addClass('Checked');
			 $('.tableButton1').removeClass('Checked');
			 $('.tableButton3').removeClass('Checked');
			 $('.tableButton4').removeClass('Checked');
			 }
			 else if ($('.tableButton3').hasClass('active')) {
			 $('.tableButton3').addClass('Checked');
			 $('.tableButton1').removeClass('Checked');
			 $('.tableButton2').removeClass('Checked');
			 $('.tableButton4').removeClass('Checked');
			 }
			 else if ($('.tableButton4').hasClass('active')) {
			 $('.tableButton4').addClass('Checked');
			 $('.tableButton1').removeClass('Checked');
			 $('.tableButton2').removeClass('Checked');
			 $('.tableButton3').removeClass('Checked');
			 }*/
		});
	})


	/** 加载全部图表 */
	const loadCharts = isInitialize => {
		let loadingStyle = {
			color: '#2BBCFF',
		};
		homeCharts.getHuizhouMap(isInitialize, loadingStyle);
		homeCharts.getNetworkElementRate(isInitialize, loadingStyle);
		homeCharts.getAssessment(isInitialize, loadingStyle);
		homeCharts.getVolte(isInitialize, loadingStyle);
		homeCharts.getBusinessDistribute(isInitialize, loadingStyle);


		/** 刷新查询时间 */
		$scope.currentDayTime = $filter('date')(NOW - (ONE_HOUR_MS * 24), 'yyyy/MM/dd');
	};

	/** 初始化加载图表 **/
	const initECharts = () => {
		let currentLeftPanel = $('#leftPanel');
		let currentLeftSideUp = $('.left-side-up');
		let currentLeftSideDown = $('.left-side-down');
		let currentRightPanel = $('#rightPanel');
		/**左上 考核指标*/
		echarts.init(document.getElementById('apChart1'));
		echarts.init(document.getElementById('apChart2'));
		echarts.init(document.getElementById('apChart3'));
		echarts.init(document.getElementById('apChart4'));
		let innerHeight = $(document).height();
		$('.progressPanel').css('height', currentLeftSideUp.height() - $('.pieChartPanel').height() - 40);
		if (innerHeight > 1000) {
			$('.progressCharts').css('padding-top', ($('.progressPanel').height() - ($('.progressCharts').height() * 5)) * 0.095);
			$('.progressCharts').css('padding-bottom', ($('.progressPanel').height() - ($('.progressCharts').height() * 5)) * 0.07);
		} else {
			$('.progressCharts').css('padding-top', ($('.progressPanel').height() - ($('.progressCharts').height() * 5)) * 0.06);
			$('.progressCharts').css('padding-bottom', ($('.progressPanel').height() - ($('.progressCharts').height() * 5)) * 0.05);
		}

		/**左上 Volte  */
		$('.horizontalBar-charts').css('height', (currentLeftSideUp.height() - 31) * 0.7);
		echarts.init(document.getElementById('callChart'));
		echarts.init(document.getElementById('regChart'));
		$('.gauge-charts').css('height', (currentLeftSideUp.height() - 31) * 0.3);
		echarts.init(document.getElementById('IMSChart'));
		echarts.init(document.getElementById('firstCallLastChart'));
		echarts.init(document.getElementById('firstCallSuccessChart'));
		/**左下 网元速率*/
		currentLeftSideDown.css('height', currentLeftPanel.height() - currentLeftSideUp.height() - currentLeftPanel.height() * 0.01);
		currentLeftSideDown.css('margin-top', currentLeftPanel.height() * 0.01);
		$('.networkElementRate-charts').css('height', (currentLeftSideDown.height() * 0.972) - 42);
		echarts.init(document.getElementById('nerChart1'));
		echarts.init(document.getElementById('nerChart2'));
		if ($scope.networkChartPage3 == true) {
			echarts.init(document.getElementById('nerChart3'));
		}
		if ($scope.networkChartPage4 == true) {
			echarts.init(document.getElementById('nerChart4'));
		}

		/**中间 地图*/
		$('#huizhouMap').css('height', currentRightPanel.height() - $('.tableStyle').height() - 57);
		echarts.init(document.getElementById('huizhouMap'));


		/**右边 业务分布*/
		//$('#bpChart1').css('height', currentRightPanel.height() * 0.35);
		//$('#bpChart2').css('height', $('#bpChart1').height());
		//echarts.init(document.getElementById('bpChart1'));
		//echarts.init(document.getElementById('bpChart2'));
		$('#aChart').css('width', currentRightPanel.width());
		$('#aChart').css('height', currentRightPanel.height() * 0.35);
		echarts.init(document.getElementById('aChart'));
		$('#twoWayBarChart').css('width', currentRightPanel.width());
		$('#twoWayBarChart').css('height', currentRightPanel.height() - 60 - $('#aChart').height() - 20);
		echarts.init(document.getElementById('twoWayBarChart'));
		loadCharts(true);
	};


	/******************** 初始化加载页面 *******************************/
	const initController = () => {
		/** 初始化加载图表 */
		initECharts();
		/** 一小时定时刷新自动刷新表格 */
		setInterval(() => loadCharts(false), $scope.refreshTime * 60000);
		/** 每10秒切换一次页面 */
		// timer = setInterval(() => itemSwitch(), 10000);
		//setInterval("$('.carousel').carousel('next');", 10000);
		//setInterval(() => test(), 10000);
	};
	initController();

	HomePageNewController.$inject = ['$scope', '$filter', '$rootScope', 'HttpRequestService'];
}