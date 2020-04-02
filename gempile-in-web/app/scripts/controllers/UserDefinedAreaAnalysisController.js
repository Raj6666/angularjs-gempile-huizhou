/**
 * Created by richstone on 2017/10/17.
 */
'use strict';

import APIS from '../configs/ApisConfig';
import Flatpickr from 'flatpickr';
const echarts = require('echarts');
import Loading from '../custom-pulgin/Loading';
import swal from 'sweetalert2';
import indicators from '../data/UserDefinedAreaAnalysisDataConfig';
import { formatNum } from '../util/tools';

import {
	NewUserDefineArea
} from './newUserDefineArea';

/**
 * ControlPanelController
 *
 * @export
 * @param $scope
 * @param $filter
 * @param HttpRequestService
 */
export default function UserDefinedAreaAnalysisController($scope, $sce, $filter, HttpRequestService) {
	/** 屏幕分辨率宽度 */
	let screenWidth = window.screen.width;
	/** 查询状态信息，显示在地图头部 */
	$scope.queryStatusMessage = '无';
	/** 查询状态信息，显示在同环比页面中*/
	$scope.queryChartMessage = '无';
	/**选择日期以及时段地区的默认值*/
	$scope.selDate = '';
	$scope.timeSlot = '';
	/**选择的区域*/
	$scope.selectOuterAreaName = '';
	$scope.selectedArea = '';
	/**初始时间值*/
	let startTime = '';
	/**配置模态框中设置的状态*/
	$scope.settingSelect = 1;
	/**是否自动刷新*/
	$scope.autoRefresh = false;
	/**时间粒度的参数值*/
	$scope.hourParticles = 60;
	/**记录时间粒度*/
	$scope.timeParticles = '小时';

	/**预设模块1-13的选择框内容*/
	$scope.indicators13 = indicators.indicatorsName13;
	/**预设模块14的选择框内容*/
	$scope.indicators14 = indicators.indicatorsName14;
	/**初始化选择框*/
	$scope.select1 = '';

	/**获取城市id*/
	let cityId = localStorage.getItem('cityId');

	/**切换天或小时时间粒度*/
	$("#sel_timeParticles").change(() => {
		$scope.timeParticles = $('#sel_timeParticles option:selected').val();
		$("#sel_timeParticles option[value='" + $('#sel_timeParticles option:selected').val() + "']").prop("selected", true);
		if ($scope.timeParticles === '小时') {
			$scope.hourParticles = 60;
			$scope.peopleGridOptions.columnDefs[0]['hourParticles'] = 60;
			$('.notClick').hide();
		} else if ($scope.timeParticles === '天') {
			$("#hourSlot option[value='']").prop("selected", true);
			$scope.timeSlot = '';
			$scope.hourParticles = 1440;
			$scope.peopleGridOptions.columnDefs[0]['hourParticles'] = 1440;
			$('.notClick').show();
		}
	});

	/**页面变化时适配饼图显示情况*/
	$(window).resize(function () {
		$('.analysis-box').css('height', '90vh');
		$('.map-indicators').css('height', $('.analysis-box').height() * 0.72);
		//$('.key-indicators').css('height', $('.analysis-box').height() - $('.map-indicators').height() - 8 - 20);
		$('.key-analysis').css('width', $('.key-indicators').width() - 45 + 'px');
	});

	/**初始化时间控件*/
	const initDatetimepicker = function initDatetimepicker() {
		let startDatePicker = null;
		let timePicker = null;
		let startPickerConfig = {
			maxDate: new Date(),
		};
		let timePickerConfig = {
			defaultDate: '00:00',
			enableTime: true,
			noCalendar: true,
			dateFormat: "H:i",
			time_24hr: true,
			//minuteIncrement: 5,
		};
		$(document).ready(() => {
			startDatePicker = new Flatpickr(document.querySelector('.selDate'), startPickerConfig);
			timePicker = new Flatpickr(document.querySelector('.selTime'), timePickerConfig);
		})
	};

	// /**根据不同地市修改地图瓦片图路径*/
	// /*if (cityId == 860752) {//惠州
	// 	mapConfig.tilesDir = mapConfig.home + 'tiles/huizhou';
	// }
	// else if (cityId == 860768) {//潮州
	// 	mapConfig.tilesDir = mapConfig.home + 'tiles/chaozhou';
	// }
	// else if (cityId == 860762) {//河源
	// 	mapConfig.tilesDir = mapConfig.home + 'tiles/heyuan';
	// }*/
	//
	// /**初始化地图*/
	// /*let map;
	// map = new BMap.Map("hz-map", {minZoom: 10, maxZoom: 19});
	// /!**根据不同地市定位到不同的中心点*!/
	// if (cityId == 860752) {//惠州
	// 	map.centerAndZoom(new BMap.Point(114.419185, 23.080332), 17);
	//
	// }
	// else if (cityId == 860768) {//潮州
	// 	map.centerAndZoom(new BMap.Point(116.628693, 23.664212), 17);
	// }
	// else if (cityId == 860762) {//河源
	// 	map.centerAndZoom(new BMap.Point(114.709796, 23.740307), 17);
	// }
	// map.enableScrollWheelZoom(true);*/
	//
	// //单击获取点击的经纬度
	// /*map.addEventListener("click",function(e){
	//  alert(e.point.lng + "," + e.point.lat);
	//  });*/
	//
	// /**创建地图小图标函数*/
	// /*function addMarker(point, cellInfo) {
	// 	let marker = new BMap.Marker(point);
	// 	map.addOverlay(marker);
	// 	/!****鼠标经过显示小区信息*!/
	// 	let cellLabel = new BMap.Label(cellInfo, {
	// 		offset: new BMap.Size(8, -9),
	// 		position: point
	// 	});
	// 	cellLabel.setStyle({
	// 		"z-index": "999",
	// 		"padding": "5px 0 5px 5px",
	// 		"width": "210px",
	// 		"height": "90px",
	// 		"border": "1px solid #999",
	// 		"cursor": "pointer",
	// 		"white-space": "pre-line",
	// 		"overflow-y": "auto",
	// 		"background": "rgba(0,0,0,0.8)",
	// 		"color": "#fff",
	// 		"font-size": "14px"
	// 	});
	// 	marker.addEventListener("mouseover", function () {
	// 		map.addOverlay(cellLabel);
	// 		cellLabel.setStyle({'display': 'block'});
	// 	});
	// 	marker.addEventListener("mouseout", function () {
	// 		cellLabel.setStyle({'display': 'none'});
	// 	});
	// 	cellLabel.addEventListener("mouseover", function () {
	// 		cellLabel.setStyle({'display': 'block'});
	// 	});
	// 	cellLabel.addEventListener("mouseout", function () {
	// 		cellLabel.setStyle({'display': 'none'});
	// 	});
	// }*/

	let map = L.map('hz-map', {
		minZoom: 0,
		maxZoom: 11,
		zoomControl: false
	});
	//设置地图级别
	/*L.control.scale({
	 position: 'topleft'
	 }).addTo(map);*/

	/**根据不同地市定位到不同的中心点*/
	if (cityId == 860752) { //惠州
		map.setView([23.080332, 114.419185], 7);
	} else if (cityId == 860768) { //潮州
		map.setView([23.664212, 116.628693], 7);
	} else if (cityId == 860762) { //河源
		map.setView([23.740307, 114.709796], 7);
	}

	// 设置瓦片图链接
	/* eslint-disable no-undef */
	const env = CONFIG;
	/* eslint-enable no-undef */
	switch (env) {
		case 'dev':
		case "devBuild":
			L.tileLayer('http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}').addTo(map);
			break;
		case 'prodBuild':
			L.tileLayer('http://188.5.33.127:8090/map/Layers/_alllayers/{z}/{y}/{x}.png').addTo(map);
			break;
		default:
			L.tileLayer('http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}').addTo(map);
			break;
	}

	/**修改地图后创建地图小图标函数*/
	let markerLayers = new L.layerGroup();
	const addMarker = (point, cellInfo) => {
		let marker = L.marker(point).addTo(markerLayers);
		let tooltip = document.querySelector('#tooltip');
		marker.on('mouseover', function (e) {
			tooltip.style.display = 'block';
			tooltip.innerHTML = cellInfo;
			let point1 = map.layerPointToContainerPoint(L.DomUtil.getPosition(marker.getElement()));
			L.DomUtil.setPosition(tooltip, point1);

		});
		marker.on('mouseout', function (e) {
			tooltip.style.display = 'none';
		});
		tooltip.addEventListener('mouseover', function () {
			tooltip.style.display = 'block';
		}, false);
		tooltip.addEventListener('mouseout', function () {
			tooltip.style.display = 'none';
		}, false);
	}

	/**自定义区域加载*/
	/**所有的区域列表*/
	$scope.outerAreaList = [];
	/** 加载小区用的对象 */
	$scope.outerAreaElementInit = {
		/** 小区分页当前页数，首次成功加载后变成1 */
		page: 0,
		/** 分页每页大小 */
		pageSize: 20,
		/** 分页返回了空数组，则认为没有后续数据，不继续加载 */
		isEmptyResult: false,
		/** 加载的过程中不触发下一次加载 */
		isLoading: false,
	};
	/** 分页加载区域列表方法 */
	$scope.getOuterAreaElementList = (isInitialize, loadingStyle) => {
		$scope.outerAreaElementInit.isLoading = true;
		let url = APIS.userDefinedArea.getAllAreaList;
		HttpRequestService.get(url, {
			pageIndex: 0,
			pageSize: -1,
			cityOid: cityId
		}, response => {
			response.map(areaElement => {
				$scope.outerAreaList.push(areaElement);
			});
			$scope.outerAreaElementInit.isLoading = false;
		}, () => {
			$scope.outerAreaElementInit.isLoading = true;
		});
	};
	/*$scope.selectOuterArea = (AreaName) => {
	 $scope.selectOuterAreaName = AreaName;
	 }*/

	/**默认区域人数以及流量*/
	$scope.provinceSubscriber = '-';
	$scope.outProvinceSubscriber = '-';
	$scope.hmtSubscriber = '-';
	$scope.internationalSubscriber = '-';
	$scope.areaSubscriber = '-';
	$scope.areaSubscriber4G = '-';
	$scope.areaSubscriber3G = '-';
	$scope.areaSubscriber2G = '-';
	$scope.areaFlow = '-';

	/** /////////新建查询模块功能/////////////////////////////////////////////////////*/
	/**自动刷新功能*/
	let timer;
	/**获取从现在到 beforetime 小时前的时间（beforetime 只能是整数）*/
	const beforeNowTime = (beforeTime) => {
		let date = new Date(); //日期对象
		date.setHours(date.getHours() - beforeTime);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		return date.valueOf();
	}

	/**当时间粒度为天时，所查询的时间*/
	const beforeNowDay = (beforeDay) => {
		let date = new Date(); //日期对象
		date.setDate(date.getDate() - beforeDay);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		return date.valueOf();
	}

	/**将时间戳转换成日期*/
	const formatDate = (timestamp) => {
		let time = new Date(timestamp);
		let year = time.getFullYear();
		let month = time.getMonth() + 1;
		let monthStr = month < 10 ? ('0' + month) : (month + '');
		let date = time.getDate();
		let dateStr = date < 10 ? ('0' + date) : (date + '');
		let hour = time.getHours();
		let hourStr = hour < 10 ? ('0' + hour) : (hour + '');
		if ($scope.timeParticles === '小时') {
			return year + "-" + monthStr + "-" + dateStr + "  " + hourStr + ":00";
		} else if ($scope.timeParticles === '天') {
			return year + "-" + monthStr + "-" + dateStr;
		}
	}

	/**自动刷新时请求的函数*/
	const autoToUserDefinedAreaAnalysis = () => {
		if ($scope.hourParticles === 60) {
			startTime = beforeNowTime(6);
			$scope.selectedTime = formatDate(beforeNowTime(6));
			$scope.queryStatusMessage = $scope.selectOuterAreaName + '，' + $scope.selectedTime;
		} else {
			startTime = beforeNowDay(1);
			$scope.selectedTime = formatDate(beforeNowDay(1));
			$scope.queryStatusMessage = $scope.selectOuterAreaName + '，' + $scope.selectedTime;
		}
		$scope.selectedArea = $scope.selectOuterAreaName;
		toUserDefinedAreaAnalysis();
	}

	/**选择是否自动刷新*/
	$('#refresh').click(() => {
		$scope.queryStatusMessage = '无';
		if ($("#refresh").is(":checked")) {
			$scope.autoRefresh = true;
			/**选择的区域不能为空*/
			if ($scope.selectOuterAreaName === '' || $scope.selectOuterAreaName === '请选择或配置区域') {
				swal({
					showCloseButton: true,
					title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
					text: '请选择或配置区域!',
					allowOutsideClick: false,
					confirmButtonText: '确定',
					confirmButtonClass: 'sure-class',
				});
				$("#refresh").prop('checked', false);
				return;
			}
			/**将选择时段的选项至空*/
			if (!$("#hourSlot option[value='']").is(":selected")) {
				$("#hourSlot option[value='']").prop("selected", true);
			}
			/**初始化时间插件*/
			initDatetimepicker();
			$scope.timeSlot = '';
			$scope.selDate = '';
			/**点击自动刷新后首先就请求一次数据*/
			autoToUserDefinedAreaAnalysis();
			/**每十分钟请求刷新一次*/
			timer = setInterval(() => {
				autoToUserDefinedAreaAnalysis();
			}, 600000);
		} else {
			$scope.autoRefresh = false;
			clearInterval(timer);
		}
	})

	/** *********1.点击查询按钮，触发刷新参数 *************************************************/
	/**点击查询*/
	$scope.clickToUserDefinedAreaAnalysis = () => {
		/***将时间日期转换成时间戳**/
		let startDate;
		if ($scope.hourParticles === 60) {
			startDate = ($scope.selDate).replace(/-/g, '/') + " " + $scope.timeSlot + ":00";
			/**页面显示查询信息*/
			$scope.selectedTime = `${$scope.selDate} ${$scope.timeSlot + ":00"}`;
			$scope.queryStatusMessage = $scope.selectOuterAreaName + '，' + $scope.selectedTime;
		} else {
			startDate = ($scope.selDate).replace(/-/g, '/');
			/**页面显示查询信息*/
			$scope.selectedTime = $scope.selDate;
			$scope.queryStatusMessage = $scope.selectOuterAreaName + '，' + $scope.selectedTime;
		}
		$scope.selectedArea = $scope.selectOuterAreaName;
		let date1 = new Date(startDate);
		startTime = date1.getTime();
		toUserDefinedAreaAnalysis();
	}

	/**点击查询时使用的方法*/
	const toUserDefinedAreaAnalysis = () => {
		//让按钮不可点击
		//$("#toUserDefinedAreaAnalysis").attr('disabled', true);
		if (!$scope.autoRefresh && $scope.selDate === '') {
			$scope.queryStatusMessage = '无';
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择时间!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			//$("toUserDefinedAreaAnalysis").attr('disabled', false);
			return;
		}
		if (!$scope.autoRefresh && (($scope.timeSlot === '' || $scope.timeSlot === null) && $scope.hourParticles === 60)) {
			$scope.queryStatusMessage = '无';
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择时间段!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			//$("toUserDefinedAreaAnalysis").attr('disabled', false);
			return;
		}
		if ($scope.selectOuterAreaName === '' || $scope.selectOuterAreaName === '请选择或配置区域') {
			$scope.queryStatusMessage = '无';
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择或配置区域!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			//$("toUserDefinedAreaAnalysis").attr('disabled', false);
			return;
		}

		if (!$scope.$page.searchData()) return false;

		/***点击查询之后将地图中的覆盖物和表格数据全部清除重新加载数据***/
		markerLayers.clearLayers();
		/*map.eachLayer(function(layer){
		 map.removeLayer(layer);
		 });
		 L.tileLayer('http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}').addTo(map);*/
		//map.clearOverlays();
		/**请求后显示地图上的指标*/
		$('.poorArea-name').show();
		$('.personnel-source').show();
		$('.personnel-distribution').show();
		$('.progressPanel').show();

		/**请求数据之后加载关键指标数据*/
		/**数据为null或者请求失败时时返回空值*/
		const nullAndFiled = (id) => {
			$(id).find('.leftBar').css('width', '0%');
			$(id).find('.rightBar').css('width', '100%');
		}
		const noNumber = (responseData, id) => {
			if (responseData === null) {
				nullAndFiled(id);
			} else {
				$(id).find('.leftBar').css('width', responseData + '%');
				$(id).find('.rightBar').css('width', 100 - responseData + '%');
			}
		}

		let scopeKey = ['httpRate', 'browseResponseSuccessRate', 'browseResponseAvgDelay', 'gameResponseSuccessRate',
			'gameResponseAvgDelay', 'videoResponseSuccessRate', 'videoResponseAvgDelay', 'instantMessageSuccessRate',
			'instantMessageResponseDelay', 'areaFlow'
		];
		let responseKey = ['rate', 'browseAppSuccessRate', 'browseAppResponseDelay', 'gameResponseSuccessRate',
			'gameResponseAvgDelay', 'videoResponseSuccessRate', 'videoResponseAvgDelay', 'instantMessageSuccessRate',
			'instantMessageResponseDelay', 'flow'
		]
		let url1 = APIS.userDefinedArea.examKpi;
		HttpRequestService.get(url1, {
			timeSlot: startTime,
			areaName: $scope.selectOuterAreaName,
			timeInterval: $scope.hourParticles,
			cityOid: cityId
		}, response => {
			/**HTTP下载速率*/
			const areaData = response.length ? response[0] : {};// 区域数据
			const cityData = response.length > 1 ? response[1] : {};
			for (let i = 0; i < scopeKey.length; i++) {
				if (areaData[responseKey[i]] === null) {
					$scope[scopeKey[i]] = '-';
				} else {
					$scope[scopeKey[i]] = formatNum(areaData[responseKey[i]]);
					$scope[scopeKey[i]+'_City'] = formatNum(cityData[responseKey[i]]);
				}
			}
			/**浏览成功率*/
			noNumber(areaData.browseAppSuccessRate, '#pChart5');
			/**游戏成功率*/
			noNumber(areaData.gameResponseSuccessRate, '#pChart2');
			/**视频成功率*/
			noNumber(areaData.videoResponseSuccessRate, '#pChart3');
			/**即时通信成功率*/
			noNumber(areaData.instantMessageSuccessRate, '#pChart4');
			$("#toPoorAreaTrendAnalysis").attr("disabled", false);
			$scope.$page.renderDefaultTemplate(areaData, cityData);
		}, () => {
			for (let i = 0; i < scopeKey.length; i++) {
				$scope[scopeKey[i]] = '-';
			}
			nullAndFiled('#pChart5');
			nullAndFiled('#pChart2');
			nullAndFiled('#pChart3');
			nullAndFiled('#pChart4');
		});

		/**请求地图小区信息接口*/
		Loading.isLoading('.loading');
		let url2 = APIS.userDefinedArea.getLongitudeAndLatitude;
		HttpRequestService.get(url2, {
			areaName: $scope.selectOuterAreaName,
			cityOid: cityId
		}, response => {
			Loading.hideLoading('.loading');
			/*let center = new BMap.Point(response.centreLongitude, response.centreLatitude);
			 map.centerAndZoom(center, response.zoomLevel);*/
			map.setView([response.centreLatitude, response.centreLongitude], response.zoomLevel);
			for (let i = 0; i < response.gemLongitudeAndLatitudeInfoList.length; i++) {
				/*let point = new BMap.Point(response.gemLongitudeAndLatitudeInfoList[i].baiDuLongitude, response.gemLongitudeAndLatitudeInfoList[i].baiDuLatitude);*/
				let info = response.gemLongitudeAndLatitudeInfoList[i].cellInfo
				let point = [response.gemLongitudeAndLatitudeInfoList[i].baiDuLatitude, response.gemLongitudeAndLatitudeInfoList[i].baiDuLongitude];
				addMarker(point, info);
			}
			map.addLayer(markerLayers);
		}, () => {
			Loading.hideLoading('.loading');
			/**根据不同地市定位到不同的中心点*/
			if (cityId == 860752) { //惠州
				map.setView([23.080332, 114.419185], 7);
			} else if (cityId == 860768) { //潮州
				map.setView([23.664212, 116.628693], 7);
			} else if (cityId == 860762) { //河源
				map.setView([23.740307, 114.709796], 7);
			}
		})

		/**先将返回的键值组合成一个数组*/
		let peopleNumber = ['provinceSubscriber', 'outProvinceSubscriber', 'hmtSubscriber',
			'internationalSubscriber', 'areaSubscriber', 'areaSubscriber4G', 'areaSubscriber3G',
			'areaSubscriber2G'
		];
		let responseUserCount = ['userCountInProv', 'userCountOutProv', 'userCountHTM',
			'userCountInternational', 'userCountTotal', 'userCount4g', 'userCount3g',
			'userCount2g'
		]
		/**人数统计接口*/
		let url3 = APIS.userDefinedArea.subscribers;
		HttpRequestService.get(url3, {
			timeSlot: startTime,
			areaName: $scope.selectOuterAreaName,
			timeInterval: $scope.hourParticles,
			cityOid: cityId
		}, response => {
			for (let i = 0; i < peopleNumber.length; i++) {
				if (response[responseUserCount[i]] === null) {
					$scope[peopleNumber[i]] = '-';
				} else {
					$scope[peopleNumber[i]] = response[responseUserCount[i]];
				}
			}
			$scope.getNumberAttribution = () => {
				$('#noPeopleAnalysis').hide();
				let numberUrl = APIS.userDefinedArea.numberAttribution;
				HttpRequestService.get(numberUrl, {
					timeSlot: startTime,
					areaName: $scope.selectOuterAreaName,
					timeInterval: $scope.hourParticles,
					cityOid: cityId
				}, data => {
					if (data == '') {
						$('#noPeopleAnalysis').show();
					}
					$scope.peopleGridOptions.data = data;
				}, () => {
					$('#noPeopleAnalysis').show();
				})
			}
		}, () => {
			for (let i = 0; i < peopleNumber.length; i++) {
				$scope[peopleNumber[i]] = '-';
			}
		})

		/**流量统计接口*/
		/*let url4 = APIS.userDefinedArea.areaFlow;
		 HttpRequestService.get(url4, {
		 timeSlot: startTime,
		 areaName: $scope.selectOuterAreaName,
		 timeInterval: $scope.hourParticles,
		 }, response => {
		 if (response.flow === null) {
		 $scope.areaFlow = '-';
		 } else {
		 $scope.areaFlow = response.flow;
		 }
		 }, () => {
		 $scope.areaFlow = '-';
		 })*/

		/**右上角接口请求*/
		let url5 = APIS.userDefinedArea.top10AppTypeFlow;
		HttpRequestService.get(url5, {
			timeSlot: startTime,
			areaName: $scope.selectOuterAreaName,
			timeInterval: $scope.hourParticles,
			cityOid: cityId,
			id: $scope.$page.appType
		}, response => {
			areaXDate.length = 0;
			areaYDate.length = 0;
			percentData.length = 0;
			for (let k = 0; k < response.length; k++) {
				areaXDate.push(response[k].appTypeName);
				areaYDate.push(response[k].flow);
				percentData.push(response[k].flowRatio);
			}
			areaOption.dataZoom[0].end = 60;
			areaChart.setOption(areaOption);
		}, () => {
			areaXDate.length = 0;
			areaYDate.length = 0;
			percentData.length = 0;
			areaChart.setOption(areaOption);
		})

		/**右下角接口请求*/
		getBigType($scope.selectBigType);
	};

	let myData = [];
	let myDataForShow = [];
	let dataFlow = [];
	let dataPeople = [];
	let dataResponseDelay = [];
	let dataResponseSuccessRate = [];
	let dataRate = [];
	const getBigType = (bigType) => {
		resizeContainer();
		let url6 = APIS.userDefinedArea.top10FlowAppSubTypeInfo;
		HttpRequestService.get(url6, {
			timeSlot: startTime,
			areaName: $scope.selectOuterAreaName,
			appTypeName: bigType,
			timeInterval: $scope.hourParticles,
			cityOid: cityId
		}, response => {
			myData.length = 0;
			myDataForShow.length = 0;
			dataFlow.length = 0;
			dataPeople.length = 0;
			dataResponseDelay.length = 0;
			dataResponseSuccessRate.length = 0;
			dataRate.length = 0;
			for (let i = 0; i < response.length; i++) {
				myData.push(response[i].appSubTypeName);
				myDataForShow.push(response[i].appSubTypeName.substring(0, 5));
				dataFlow.push(response[i].flow);
				dataResponseDelay.push(response[i].responseDelay);
				dataResponseSuccessRate.push(response[i].responseSuccessRate);
				dataRate.push(response[i].rate);
			}
			//let twoWayBarChart1 = echarts.init(document.getElementById('time_delay_chart'));
			let twoWayBarChart2 = echarts.getInstanceByDom(document.getElementById('response_success_rate_chart'));
			let twoWayBarChart3 = echarts.getInstanceByDom(document.getElementById('download_speed_chart'));
			let twoWayBarChart4 = echarts.getInstanceByDom(document.getElementById('upload_speed_chart'));
			let twoWayBarOption1 = {
				baseOption: {
					backgroundColor: '#fff',
					title: {
						show: false,
					},
					legend: {
						show: false,
						data: [{
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
							}
						],
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
								res = $scope.selectedTime + '<br>' + params.name + '<br/>' + params.seriesName + ': ' + params.data + '人';
							} else {
								res = $scope.selectedTime + '<br>' + params.name + '<br/>' + params.seriesName + ': ' + params.data + 'GB';
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
						left: '2%',
						top: -25,
						bottom: 5,
						containLabel: true,
						width: '54%',
					}, {
						show: false,
						left: '51.5%',
						top: -3,
						bottom: 5,
						width: '0%',
					}, {
						show: false,
						right: '2%',
						top: -25,
						bottom: 5,
						containLabel: true,
						width: '55%',
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
							margin: 10,
							textStyle: {
								color: '#9D9EA0',
								fontSize: 12,
							},

						},
						data: myData,
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
						data: myData.map(function (value) {
							return {
								value: value,
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
							margin: 10,
							textStyle: {
								color: '#9D9EA0',
								fontSize: 12,
							},

						},
						data: myData,
					}],
					series: [{
							name: '用户数',
							type: 'bar',
							barGap: 5,
							barWidth: 17,
							label: {
								normal: {
									show: false,
								},
								emphasis: {
									show: true,
									position: 'left',
									offset: [0, 0],
									textStyle: {
										color: '#fff',
										fontSize: 14,
									},
								},
							},
							itemStyle: {
								normal: {
									color: '#fd9732',
									barBorderRadius: [5, 5, 5, 5],
								},
								emphasis: {
									color: '#FDA93B',
								},
							},
							data: dataPeople,
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
									show: false,
								},
								emphasis: {
									show: true,
									position: 'right',
									offset: [0, 0],
									textStyle: {
										color: '#fff',
										fontSize: 14,
									},
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
							data: dataFlow,
						},
					],
				},
			};
			let twoWayBarOption2 = {
				baseOption: {
					backgroundColor: '#fff',
					title: {
						show: false,
					},
					legend: {
						show: false,
						data: [{
								name: '响应时延',
								textStyle: {
									align: 'right',
								},
							},
							{
								name: '流量',
								textStyle: {
									align: 'left',
								},
							}
						],
						itemGap: 75,
						top: -4,
						left: 104,
					},
					tooltip: {
						show: true,
						trigger: 'item',
						formatter: function (params) {
							let res;
							if (params.seriesIndex === 0) {
								res = $scope.selectedTime + '<br>' + myData[params.dataIndex] + '<br/>' + params.seriesName + ': ' + params.data + 'ms';
							} else {
								res = $scope.selectedTime + '<br>' + myData[params.dataIndex] + '<br/>' + params.seriesName + ': ' + params.data + 'GB';
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
						left: '1%',
						top: -25,
						bottom: 5,
						containLabel: true,
						width: '55%',
					}, {
						show: false,
						left: '51.6%',
						top: -3,
						bottom: 5,
						width: '2%',
					}, {
						show: false,
						right: '1%',
						top: -25,
						bottom: 5,
						containLabel: true,
						width: '56%',
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
							data: myDataForShow,
						}, {
							gridIndex: 1,
							type: 'category',
							inverse: true,
							position: 'center',
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
									align: 'center'
								},
								formatter: function (value) {
									return value.substring(0, 5);
								}

							},
							data: myDataForShow,
						},
						{
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
								margin: 10,
								textStyle: {
									color: '#9D9EA0',
									fontSize: 12,
								},

							},
							data: myDataForShow,
						}
					],
					series: [{
							name: '响应时延',
							type: 'bar',
							barGap: 5,
							barWidth: 17,
							label: {
								normal: {
									show: false,
								},
								emphasis: {
									show: true,
									position: 'left',
									offset: [0, 0],
									textStyle: {
										color: '#fff',
										fontSize: 14,
									},
								},
							},
							itemStyle: {
								normal: {
									color: '#F51E16',
									barBorderRadius: [5, 5, 5, 5],
								},
								emphasis: {
									color: '#f54628',
								},
							},
							data: dataResponseDelay,
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
									show: false,
								},
								emphasis: {
									show: true,
									position: 'right',
									offset: [0, 0],
									textStyle: {
										color: '#fff',
										fontSize: 14,
									},
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
							data: dataFlow,
						},
					],
				},
			};
			let twoWayBarOption3 = {
				baseOption: {
					backgroundColor: '#fff',
					title: {
						show: false,
					},
					legend: {
						show: false,
						data: [{
								name: '响应成功率',
								textStyle: {
									align: 'right',
								},
							},
							{
								name: '流量',
								textStyle: {
									align: 'left',
								},
							}
						],
						itemGap: 75,
						top: -4,
						left: 104,
					},
					tooltip: {
						show: true,
						trigger: 'item',
						formatter: function (params) {
							let res;
							if (params.seriesIndex === 0) {
								res = $scope.selectedTime + '<br>' + myData[params.dataIndex] + '<br/>' + params.seriesName + ': ' + params.data + '%';
							} else {
								res = $scope.selectedTime + '<br>' + myData[params.dataIndex] + '<br/>' + params.seriesName + ': ' + params.data + 'GB';
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
						left: '1%',
						top: -25,
						bottom: 5,
						containLabel: true,
						width: '55%',
					}, {
						show: false,
						left: '51.6%',
						top: -3,
						bottom: 5,
						width: '2%',
					}, {
						show: false,
						right: '1%',
						top: -25,
						bottom: 5,
						containLabel: true,
						width: '56%',
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
							margin: 10,
							textStyle: {
								color: '#9D9EA0',
								fontSize: 12,
							},

						},
						data: myDataForShow,
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
								align: 'center',
							},

						},
						data: myDataForShow,
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
							margin: 10,
							textStyle: {
								color: '#9D9EA0',
								fontSize: 12,
							},

						},
						data: myDataForShow,
					}],
					series: [{
							name: '响应成功率',
							type: 'bar',
							barGap: 5,
							barWidth: 17,
							label: {
								normal: {
									show: false,
								},
								emphasis: {
									show: true,
									position: 'left',
									offset: [0, 0],
									textStyle: {
										color: '#fff',
										fontSize: 14,
									},
								},
							},
							itemStyle: {
								normal: {
									color: '#018101',
									barBorderRadius: [5, 5, 5, 5],
								},
								emphasis: {
									color: '#019A01',
								},
							},
							data: dataResponseSuccessRate,
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
									show: false,
								},
								emphasis: {
									show: true,
									position: 'right',
									offset: [0, 0],
									textStyle: {
										color: '#fff',
										fontSize: 14,
									},
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
							data: dataFlow,
						},
					],
				},
			};
			let twoWayBarOption4 = {
				baseOption: {
					backgroundColor: '#fff',
					title: {
						show: false,
					},
					legend: {
						show: false,
						data: [{
								name: '速率',
								textStyle: {
									align: 'right',
								},
							},
							{
								name: '流量',
								textStyle: {
									align: 'left',
								},
							}
						],
						itemGap: 75,
						top: -4,
						left: 104,
					},
					tooltip: {
						show: true,
						trigger: 'item',
						formatter: function (params) {
							let res;
							if (params.seriesIndex === 0) {
								res = $scope.selectedTime + '<br>' + myData[params.dataIndex] + '<br/>' + params.seriesName + ': ' + params.data + 'Mbps';
							} else {
								res = $scope.selectedTime + '<br>' + myData[params.dataIndex] + '<br/>' + params.seriesName + ': ' + params.data + 'GB';
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
						left: '1%',
						top: -25,
						bottom: 5,
						containLabel: true,
						width: '55%',
					}, {
						show: false,
						left: '51.6%',
						top: -3,
						bottom: 5,
						width: '2%',
					}, {
						show: false,
						right: '1%',
						top: -25,
						bottom: 5,
						containLabel: true,
						width: '56%',
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
							margin: 10,
							textStyle: {
								color: '#9D9EA0',
								fontSize: 12,
							},

						},
						data: myDataForShow,
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
								align: 'center',
							},

						},
						data: myDataForShow,
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
							margin: 10,
							textStyle: {
								color: '#9D9EA0',
								fontSize: 12,
							},
						},
						data: myDataForShow,
					}],
					series: [{
							name: '速率',
							type: 'bar',
							barGap: 5,
							barWidth: 17,
							label: {
								normal: {
									show: false,
								},
								emphasis: {
									show: true,
									position: 'left',
									offset: [0, 0],
									textStyle: {
										color: '#fff',
										fontSize: 14,
									},
								},
							},
							itemStyle: {
								normal: {
									color: '#ffcd08',
									barBorderRadius: [5, 5, 5, 5],
								},
								emphasis: {
									color: '#F3F212',
								},
							},
							data: dataRate,
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
									show: false,
								},
								emphasis: {
									show: true,
									position: 'right',
									offset: [0, 0],
									textStyle: {
										color: '#fff',
										fontSize: 14,
									},
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
							data: dataFlow,
						},
					],
				},
			};
			switch (screenWidth) {
				case 1680:
				case 1600:
					twoWayBarOption2.baseOption.grid[0].width = '54%';
					twoWayBarOption2.baseOption.grid[2].width = '55%';
					twoWayBarOption3.baseOption.grid[0].width = '54%';
					twoWayBarOption3.baseOption.grid[2].width = '55%';
					twoWayBarOption4.baseOption.grid[0].width = '54%';;
					twoWayBarOption4.baseOption.grid[2].width = '55%';
					twoWayBarOption2.baseOption.grid[1].left = '51.2%';
					twoWayBarOption3.baseOption.grid[1].left = '51.2%';
					twoWayBarOption4.baseOption.grid[1].left = '51.2%';
					break;
				case 1920:
					twoWayBarOption2.baseOption.grid[0].width = '53%';
					twoWayBarOption2.baseOption.grid[2].width = '54%';
					twoWayBarOption3.baseOption.grid[0].width = '53%';
					twoWayBarOption3.baseOption.grid[2].width = '54%';
					twoWayBarOption4.baseOption.grid[0].width = '53%';;
					twoWayBarOption4.baseOption.grid[2].width = '54%';
					twoWayBarOption2.baseOption.grid[1].left = '51%';
					twoWayBarOption3.baseOption.grid[1].left = '51%';
					twoWayBarOption4.baseOption.grid[1].left = '51%';
					break;
				default:
					break;
			}
			twoWayBarChart2.setOption(twoWayBarOption2);
			twoWayBarChart3.setOption(twoWayBarOption3);
			twoWayBarChart4.setOption(twoWayBarOption4);

			/**双向柱形图点击出现同环比图*/
			const twoWayBarClick = (twoWayBarChart) => {
				twoWayBarChart.off();
				twoWayBarChart.on('click', function (param) {
					let unit = '';
					if (param.seriesName == '响应时延' || param.seriesName == '速率') {
						unit = '(ms)';
					} else if (param.seriesName == '响应成功率') {
						unit = '(%)';
					} else if (param.seriesName == '用户数') {
						unit = '(人)';
					}
					$scope.indicators = bigType + '中' + param.name + '的' + param.seriesName + unit;
					let url = APIS.userDefinedArea.subType;
					let param1 = {
						timeInterval: $scope.hourParticles,
						time: startTime,
						area: $scope.selectOuterAreaName,
						queryType: param.seriesName,
						appTypeName: bigType,
						appSubTypeName: param.name,
						cityOid: cityId
					};
					setOption(url, param1)
				})
			}
			twoWayBarClick(twoWayBarChart2);
			twoWayBarClick(twoWayBarChart3);
			twoWayBarClick(twoWayBarChart4);
			twoWayBarChart2.resize();
		}, () => {
			myData.length = 0;
			myDataForShow.length = 0;
			dataFlow.length = 0;
			dataResponseDelay.length = 0;
			dataResponseSuccessRate.length = 0;
			dataRate.length = 0;
		})
	}

	/**2.配置按钮部分功能** **/

	/**********************   区域管理部分  start  *****************/
	/***获取所有小区*/
	/** 所有小区列表 */
	$scope.cellElementList = [];
	/** 被选中的小区列表 */
	$scope.selectedCellElementList = [];
	/** 被选中小区的id集合 */
	let selectedCellElementIdSet = new Set();
	/** 加载小区用的对象 */
	$scope.cellElementInit = {
		/** 小区分页当前页数，首次成功加载后变成1 */
		page: 0,
		/** 分页每页大小 */
		pageSize: 20,
		/** 分页返回了空数组，则认为没有后续数据，不继续加载 */
		isEmptyResult: false,
		/** 加载的过程中不触发下一次加载 */
		isLoading: false,
		/**搜索的关键字*/
		keyword: '',
	};
	/** 搜索小区列表 */
	$scope.cellNetworkElementList = () => {
		$scope.cellElementList = [];
		$scope.cellElementInit.page = 0;
		$scope.cellElementInit.isEmptyResult = false;
		$scope.getCellElementList();
	};
	/** 分页加载小区列表方法 */
	$scope.getCellElementList = () => {
		if ($scope.cellElementInit.isLoading || $scope.cellElementInit.isEmptyResult) {
			return;
		}
		$scope.cellElementInit.isLoading = true;
		Loading.isLoading('#getCellList');
		let url = APIS.userDefinedArea.getSearchCellList;
		HttpRequestService.get(url, {
			pageIndex: $scope.cellElementInit.page + 1,
			pageSize: $scope.cellElementInit.pageSize,
			searchWord: $scope.cellElementInit.keyword,
			cityOid: cityId
		}, response => {
			if (response && response.length != 0) {
				$scope.cellElementInit.page++;
				response.map(cellElement => {
					$scope.cellElementList.push(cellElement);
				});
			} else {
				$scope.cellElementInit.isEmptyResult = true;
			}
			$scope.cellElementInit.isLoading = false;
			Loading.hideLoading('#getCellList');
		}, () => {
			$scope.cellElementInit.isLoading = true;
			Loading.hideLoading('#getCellList');
		});
	};
	/** 把添加到选中列表 */
	$scope.selectCellElementUnShift = thisCellElement => {
		if (!selectedCellElementIdSet.has(thisCellElement)) {
			$scope.selectedCellElementList.unshift(thisCellElement);
			selectedCellElementIdSet.add(thisCellElement);
		}
	};
	/** 清除全部选中的指标 */
	$scope.clearSelectedCellList = () => {
		$scope.selectedCellElementList = [];
		selectedCellElementIdSet = new Set();
	};
	/** 移除选中的单个指标 */
	$scope.removeThisCellElement = (cellElement, index) => {
		console.log(index)
		selectedCellElementIdSet.delete(cellElement.cellId);
		$scope.selectedCellElementList.splice(index, 1);
		//由于下面的方法是通过id判断的，但是后端没有返回id所以无法实行
		/*for (let i = 0; i < $scope.selectedCellElementList.length; i++) {
		 if ($scope.selectedCellElementList[i].cellId === cellElement.cellId) {
		 $scope.selectedCellElementList.splice(i, 1);
		 break;
		 }
		 }*/
		selectedCellElementIdSet = new Set();
		//$scope.selectedCellElementList.remove(cellElement);
	};

	/**所有的区域列表*/
	$scope.areaList = [];
	/** 加载小区用的对象 */
	$scope.areaElementInit = {
		/** 小区分页当前页数，首次成功加载后变成1 */
		page: 0,
		/** 分页每页大小 */
		pageSize: 20,
		/** 分页返回了空数组，则认为没有后续数据，不继续加载 */
		isEmptyResult: false,
		/** 加载的过程中不触发下一次加载 */
		isLoading: false,
		/**搜索的关键字*/
		keyword: '',
	};
	/**选择的区域*/
	$scope.selectAreaName = '';

	/** 分页加载区域列表方法 */
	$scope.getAreaElementList = () => {
		$scope.areaElementInit.isLoading = true;
		let url = APIS.userDefinedArea.getAllAreaList;
		HttpRequestService.get(url, {
			pageIndex: 0,
			pageSize: -1,
			cityOid: cityId
		}, response => {
			response.map(areaElement => {
				$scope.areaList.push(areaElement);
			});
			$scope.areaElementInit.isLoading = false;
		}, () => {
			$scope.areaElementInit.isLoading = true;
		});
	};

	/**点击自定义区域下拉框*/ //此功能已移植到别的地方
	$scope.selectOneArea = (areaElementName) => {
		/**切换按钮值*/
		$scope.selectAreaName = areaElementName;
		Loading.isLoading('#getCellListByArea');
		/**请求该区域的小区*/
		let url = APIS.userDefinedArea.getCellListByArea;
		HttpRequestService.get(url, {
			pageIndex: 0,
			pageSize: -1,
			areaName: areaElementName,
			cityOid: cityId
		}, response => {
			selectedCellElementIdSet = new Set();
			$scope.selectedCellElementList = response;
			Loading.hideLoading('#getCellListByArea');
			for (let i = 0; i < $scope.selectedCellElementList.length; i++) {
				selectedCellElementIdSet.add($scope.selectedCellElementList[i]);
			}
		}, () => {
			Loading.hideLoading('#getCellListByArea');
		});
	};

	/**点击删除区域*/
	$scope.deleteOwnArea = (areaElement) => {
		if ($scope.selectAreaName === '' || $scope.areaSelectedModel == '') {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请先选择自定义区域！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		swal({
			showCloseButton: true,
			title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
			text: '是否删除自定义区域！',
			allowOutsideClick: false,
			confirmButtonText: '是',
			showCancelButton: true,
			cancelButtonText: '否',
			confirmButtonClass: 'confirm-class',
			cancelButtonClass: 'cancel-class'
		}).then(function (isConfirm) {
			if (isConfirm === true) {
				/**请求删除接口*/
				let url = APIS.userDefinedArea.deleteOneArea;
				HttpRequestService.get(url, {
					areaName: areaElement,
					cityOid: cityId
				}, response => {
					if (response > 0) {
						$scope.selectAreaName = '';
						$scope.areaSelectedModel = [];
						//$scope.selectOuterAreaName='请选择或配置区域';
						$scope.selectedCellElementList = [];
						selectedCellElementIdSet = new Set();
						$scope.areaList = [];
						$scope.getAreaElementList();
						$scope.outerAreaList = [];
						$scope.getOuterAreaElementList();
						swal({
							showCloseButton: true,
							title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
							text: '删除成功！',
							allowOutsideClick: false,
							confirmButtonText: '确定',
							confirmButtonClass: 'sure-class',
						});
						$scope.outerAreaSelectedModel = [];
					} else if (response <= 0) {
						swal({
							showCloseButton: true,
							title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
							text: '删除失败，请重新删除！',
							allowOutsideClick: false,
							confirmButtonText: '确定',
							confirmButtonClass: 'sure-class',
						});
					}
				}, () => {
					swal({
						showCloseButton: true,
						title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
						text: '出错了，请稍后再试！',
						allowOutsideClick: false,
						confirmButtonText: '确定',
						confirmButtonClass: 'sure-class',
					});
				});
			}
		});
	};

	/**点击设置按钮对区域进行管理*/
	$scope.setAreaInformation = () => {
		if ($scope.selectAreaName === '' || $scope.areaSelectedModel == '') {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请先选择自定义区域！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		if ($scope.selectedCellElementList.length == 0) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '存在未选择小区的区域，是否删除！',
				allowOutsideClick: false,
				confirmButtonText: '是',
				showCancelButton: true,
				cancelButtonText: '否',
				confirmButtonClass: 'confirm-class',
				cancelButtonClass: 'cancel-class',
			}).then(function (isConfirm) {
				if (isConfirm === true) {
					/**请求删除接口*/
					let url = APIS.userDefinedArea.deleteOneArea;
					HttpRequestService.get(url, {
						areaName: $scope.selectAreaName,
					}, response => {
						if (response > 0) {
							$scope.selectAreaName = '请选择或配置区域';
							//$scope.selectOuterAreaName='请选择或配置区域';
							$scope.selectedCellElementList = [];
							selectedCellElementIdSet = new Set();
							$scope.areaList = [];
							$scope.getAreaElementList();
							$scope.outerAreaList = [];
							$scope.getOuterAreaElementList();
							swal({
								showCloseButton: true,
								title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
								text: '删除成功！',
								allowOutsideClick: false,
								confirmButtonText: '确定',
								confirmButtonClass: 'sure-class',
							});
						} else if (response <= 0) {
							swal({
								showCloseButton: true,
								title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
								text: '删除失败，请重新删除！',
								allowOutsideClick: false,
								confirmButtonText: '确定',
								confirmButtonClass: 'sure-class',
							});
						}
					}, () => {
						swal({
							showCloseButton: true,
							title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
							text: '出错了，请稍后再试！',
							allowOutsideClick: false,
							confirmButtonText: '确定',
							confirmButtonClass: 'sure-class',
						});
					});
				}
			});
			return;
		}
		/*let selectCellNameList = [];
		 for (let i = 0; i < $scope.selectedCellElementList.length; i++) {
		 selectCellNameList.push('[' + $scope.selectedCellElementList[i].netType + ']' + $scope.selectedCellElementList[i].cellName + '(' + $scope.selectedCellElementList[i].cellId + ')');
		 }*/
		let url = APIS.userDefinedArea.updateArea;
		HttpRequestService.post(url, null, {
			areaName: $scope.selectAreaName,
			cellList: $scope.selectedCellElementList,
			cityOid: cityId
		}, response => {
			$scope.selectAreaName = '请选择或配置区域';
			//$scope.selectOuterAreaName='请选择或配置区域';
			//$scope.selectedCellElementList = [];
			//selectedCellElementIdSet = new Set();
			$scope.areaList = [];
			$scope.getAreaElementList();
			$scope.outerAreaList = [];
			$scope.getOuterAreaElementList();
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '修改成功！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
		}, () => {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '出错了！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
		})
	};
	/**********************   区域管理部分  end  *****************/


	/**********************   新增设置部分  start  *****************/
	$scope.setAreaName = '';
	/***获取所有小区*/
	/** 所有小区列表 */
	$scope.newCellElementList = [];
	/** 被选中的小区列表 */
	$scope.selectedNewCellElementList = [];
	/** 被选中小区的id集合 */
	let selectedNewCellElementIdSet = new Set();
	/** 加载小区用的对象 */
	$scope.newCellElementInit = {
		/** 小区分页当前页数，首次成功加载后变成1 */
		page: 0,
		/** 分页每页大小 */
		pageSize: 20,
		/** 分页返回了空数组，则认为没有后续数据，不继续加载 */
		isEmptyResult: false,
		/** 加载的过程中不触发下一次加载 */
		isLoading: false,
		/**搜索的关键字*/
		keyword: '',
	};
	/** 搜索小区列表 */
	$scope.newCellNetworkElementList = () => {
		$scope.newCellElementList = [];
		$scope.newCellElementInit.page = 0;
		$scope.newCellElementInit.isEmptyResult = false;
		$scope.getNewCellElementList();
	};
	/** 分页加载小区列表方法 */
	$scope.getNewCellElementList = () => {
		if ($scope.newCellElementInit.isLoading || $scope.newCellElementInit.isEmptyResult) {
			return;
		}
		$scope.newCellElementInit.isLoading = true;
		Loading.isLoading('#getNewCellList');
		let url = APIS.userDefinedArea.getSearchCellList;
		HttpRequestService.get(url, {
			pageIndex: $scope.newCellElementInit.page + 1,
			pageSize: $scope.newCellElementInit.pageSize,
			searchWord: $scope.newCellElementInit.keyword,
			cityOid: cityId
		}, response => {
			if (response && response.length != 0) {
				$scope.newCellElementInit.page++;
				response.map(cellElement => {
					$scope.newCellElementList.push(cellElement);
				});
			} else {
				$scope.newCellElementInit.isEmptyResult = true;
			}
			$scope.newCellElementInit.isLoading = false;
			Loading.hideLoading('#getNewCellList');
		}, () => {
			$scope.newCellElementInit.isLoading = true;
			Loading.hideLoading('#getNewCellList');
		});
	};
	/** 把网元添加到选中列表（逆序） */
	$scope.selectNewCellElementUnShift = thisNewCellElement => {
		if (!selectedNewCellElementIdSet.has(thisNewCellElement)) {
			$scope.selectedNewCellElementList.unshift(thisNewCellElement);
			selectedNewCellElementIdSet.add(thisNewCellElement);
		}
	};
	/** 清除全部选中的指标 */
	$scope.clearSelectedNewCellList = () => {
		$scope.selectedNewCellElementList = [];
		selectedNewCellElementIdSet = new Set();
	};
	/** 移除选中的单个指标 */
	$scope.removeThisNewCellElement = (newCellElement, index) => {
		selectedNewCellElementIdSet.delete(newCellElement.cellId);
		$scope.selectedNewCellElementList.splice(index, 1);
		/*for (let i = 0; i < $scope.selectedNewCellElementList.length; i++) {
		 if ($scope.selectedNewCellElementList[i].cellId === newCellElement.cellId) {
		 $scope.selectedNewCellElementList.splice(i, 1);
		 break;
		 }
		 }*/
		selectedNewCellElementIdSet = new Set();
	};
	/**点击新增按钮对区域进行管理*/
	$scope.setNewArea = () => {
		if ($scope.setAreaName === '') {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请先定义自定义区域名！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		if ($scope.selectedNewCellElementList.length == 0) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '小区信息不能为空！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		if ($scope.setAreaName.length > 15) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '区域名不能超过15字，请重新设置！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			$scope.setAreaName = '';
			return;
		}
		/*let selectNewCellNameList = [];
		 for (let i = 0; i < $scope.selectedNewCellElementList.length; i++) {
		 selectNewCellNameList.push($scope.selectedNewCellElementList[i].cellName)
		 }*/
		let url = APIS.userDefinedArea.addNewArea;
		HttpRequestService.post(url, null, {
			areaName: $scope.setAreaName,
			cellList: $scope.selectedNewCellElementList,
			cityOid: cityId,
		}, response => {
			if (response <= 0) {
				swal({
					showCloseButton: true,
					title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
					text: '区域名已存在，请重新设置！',
					allowOutsideClick: false,
					confirmButtonText: '确定',
					confirmButtonClass: 'sure-class',
				});
				$scope.setAreaName = '';
				return;
			}
			$scope.setAreaName = '';
			$scope.selectedNewCellElementList = [];
			selectedNewCellElementIdSet = new Set();
			$scope.selectAreaName = '请选择或配置区域';
			$scope.selectedCellElementList = [];
			selectedCellElementIdSet = new Set();
			$scope.areaList = [];
			$scope.getAreaElementList();
			$scope.outerAreaList = [];
			$scope.getOuterAreaElementList();
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '添加成功！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return false;
		}, () => {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '出错了！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
		})
	};

	/**导入模块*/
	$scope.submitFile = () => {
		let myForm = new FormData();
		let fileObj = document.getElementById('myFile').files[0];
		if (fileObj == null) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择文件后再进行上传！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		let fileType = fileObj.name.substring(fileObj.name.lastIndexOf("."), fileObj.name.length);
		let url = APIS.userDefinedArea.importNewArea + '?cityOid=' + cityId;
		if (fileType != ".csv") {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '导入文件格式不对！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			clearFileInput('myFile');
			return;
		}
		if (fileObj.size > 10 * 1024 * 1024) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请上传小于10M的文件！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		myForm.append('file', fileObj);
		/**清空input文件*/
		function clearFileInput(fileId) {
			var file = $('#' + fileId);
			file.after(file.clone().val(""));
			file.remove();
		}

		Loading.isLoading('#fileUploadContainer');
		$.ajax({
			url: url,
			data: myForm,
			type: 'post',
			dataType: 'json',
			cache: false, //上传文件无需缓存
			processData: false, //用于对data参数进行序列化处理 这里必须false
			contentType: false, //必须
			success: function () {
				Loading.hideLoading('#fileUploadContainer');
				/**清空input文件*/
				clearFileInput('myFile');
				swal({
					showCloseButton: true,
					title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
					text: '导入成功!',
					allowOutsideClick: false,
					confirmButtonText: '确定',
					confirmButtonClass: 'sure-class',
				});
				$('#myExcelModal').modal('hide');
				$scope.areaList = [];
				$scope.getAreaElementList();
				$scope.outerAreaList = [];
				$scope.getOuterAreaElementList();
			},
			error: function (e) {
				Loading.hideLoading('#fileUploadContainer');
				clearFileInput('myFile');
				swal({
					showCloseButton: true,
					title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
					html: '导入失败<br>' + '失败原因：' + e.responseJSON.errorMessage,
					allowOutsideClick: false,
					confirmButtonText: '确定',
					confirmButtonClass: 'sure-class',
				});
			},
		})
	}
	/**********************   新增设置部分  end  *****************/

	/**模态框中切换设置*/
	$scope.selectFirst = () => {
		$scope.settingSelect = 1;
		$('.area-administer').addClass('selected');
		$('.new-settings').removeClass('selected');
	};
	$scope.selectSecond = () => {
		$scope.settingSelect = 2;
		$('.area-administer').removeClass('selected');
		$('.new-settings').addClass('selected');
	};

	/**********3.全屏功能******/
	$scope.fullPage = () => {
		$('.map-indicators').addClass('full_screen');
		$('.close_full_screen').show();
	};
	$scope.noFullScreen = () => {
		$('.map-indicators').removeClass('full_screen');
		$('.close_full_screen').hide();
		$('.key-indicators').css('height', $('.analysis-box').height() - $('.map-indicators').height() - 8 - 20);
		$(window).resize = () => {
			$('.key-indicators').css({
				'width': $('.map-and-keyIndicators').width()
			}, {
				'height': $('.analysis-box').height() - $('.map-indicators').height() - 8 - 20
			});
		};
	};

	/**模态框的可拖拽功能*/
	/*$(".allocation-content").draggable({
	 handle: ".allocation-header",
	 containment: 'parent',
	 onDrag: function (e) {
	 //console.log(e);
	 if ($(this).offset().top < 0) {
	 $(this).offset({top: 0});
	 }
	 if ($(".modal-content").offset().left < 0) {
	 $(".modal-content").offset().left = 0;
	 }
	 if ($(".modal-content").offset().top + $(".modal-content").height() > window.innerHeight) {
	 $(".modal-content").offset().top = window.innerHeight - $(".modal-content").height();
	 }
	 if ($(".modal-content").offset().left + $(".modal-content").width() > window.innerWidth) {
	 $(".modal-content").offset().left = window.innerWidth - $(".modal-content").width();
	 }
	 },
	 });//为模态对话框添加拖拽
	 $("#myModal").css("overflow", "hidden");//禁止模态对话框的半透明背景滚动*/

	/*模态框的可拖动范围*/
	/*function onDrag(e) {
	 var d = e.data;
	 if (d.left < 0) {
	 d.left = 0
	 }
	 if (d.top < 0) {
	 d.top = 0
	 }
	 if (d.left + $(d.target).outerWidth() > $(d.parent).width()) {
	 d.left = $(d.parent).width() - $(d.target).outerWidth();
	 }
	 if (d.top + $(d.target).outerHeight() > $(d.parent).height()) {
	 d.top = $(d.parent).height() - $(d.target).outerHeight();
	 }
	 }*/

	/**缩放*/
	/*$('.allocation-content').resizable({
	 maxWidth: 800,
	 maxHeight: 1000,
	 minWidth: 500,
	 minHeight: 548,
	 handles: 'ne, se, sw, nw',
	 });*/


	/**改变modal的层级*/
	$(document).ready(function () {
		// 通过该方法来为每次弹出的模态框设置最新的zIndex值，从而使最新的modal显示在最前面
		$(document).on('show.bs.modal', '.modal', function () {
			var zIndex = 1040 + (10 * $('.modal:visible').length);
			$(this).css('z-index', zIndex);
			setTimeout(function () {
				$('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
			}, 0);
		});
	});

	/**初始化业务指标表*/
	/**重新设置图表容器的宽高*/
	let areaContainer = document.getElementById('areaChart');
	//let timeContainer = document.getElementById('time_delay_chart');
	let responseContainer = document.getElementById('response_success_rate_chart');
	let downloadContainer = document.getElementById('download_speed_chart');
	let uploadContainer = document.getElementById('upload_speed_chart');
	const resizeContainer = () => {
		//console.log($('.key-analysis').width());
		areaContainer.style.width = ($('.areaBox').width()) + 'px';
		areaContainer.style.height = $('.areaBox').height() + 'px';
		//timeContainer.style.width = ($('.twoWayBarChartPanel').width()) + 'px';
		//timeContainer.style.height = $('.twoWayBarChartPanel').height() + 'px';
		responseContainer.style.width = ($('.twoWayBarChartPanel').width()) + 'px';
		responseContainer.style.height = $('.twoWayBarChartPanel').height() + 'px';
		downloadContainer.style.width = ($('.twoWayBarChartPanel').width()) + 'px';
		downloadContainer.style.height = $('.twoWayBarChartPanel').height() + 'px';
		uploadContainer.style.width = ($('.twoWayBarChartPanel').width()) + 'px';
		uploadContainer.style.height = $('.twoWayBarChartPanel').height() + 'px';
		//console.log($('.tab-content').height());
	};

	/**屏幕自适应 ——浏览器大小改变时重置图表宽高*/
	$(window).resize(function () {
		resizeContainer();
		/**面积图*/
		let areaChart = echarts.getInstanceByDom(document.getElementById('areaChart'));
		areaChart.resize();
		/**右下半部分双向柱形图*/
		//let twoWayBarChart1 = echarts.getInstanceByDom(document.getElementById('time_delay_chart'));
		//twoWayBarChart1.resize();
		let twoWayBarChart2 = echarts.getInstanceByDom(document.getElementById('response_success_rate_chart'));
		twoWayBarChart2.resize();
		let twoWayBarChart3 = echarts.getInstanceByDom(document.getElementById('download_speed_chart'));
		twoWayBarChart3.resize();
		let twoWayBarChart4 = echarts.getInstanceByDom(document.getElementById('upload_speed_chart'));
		twoWayBarChart4.resize();
	});

	/**右上半部分面积图*/
	let areaChart = echarts.init(document.getElementById('areaChart'));
	let areaOption = {};
	let areaXDate = [];
	let areaYDate = [];
	let percentData = [];
	const initAreaChart = () => {
		//指定图标的配置和数据
		areaOption = {
			title: {
				show: true,
				text: '',
				x: 'center',
				textStyle: {
					fontSize: 13,
					fontWeight: 'normal',
					color: '#333'
				}
			},
			tooltip: {
				show: true,
				trigger: 'axis',
				//formatter: $scope.selectedTime + "<br/>{b} <br/>{c}GB ",
				formatter: function (params) {
					return $scope.$page.setAreaOption(params, percentData);
				}
			},
			grid: {
				top: 30, //距离容器上边界40像素
				bottom: 88, //距离容器下边界30像素
				left: '11%',
				right: '13%',

			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				name: "",
				data: areaXDate,
				//['流量下载', '邮箱', '出行旅游', '应用商店', '即时通信', '彩信', '网云盘服务', '视频', '导航', '音乐', '游戏', '阅读', '财经',
				//'安全杀毒', 'VolP业务', '支付', '动漫', 'P2P业务', '微博社区', '购物', '其他'],
				axisLabel: {
					interval: 0,
					rotate: 42,
					//clickable:true,
					textStyle: {
						fontSize: 11
					}
				},
			},
			yAxis: {
				name: "",
				axisLabel: {
					textStyle: {
						fontSize: 11
					}
				},
			},
			dataZoom: [{
				show: true,
				realtime: true,
				start: 0,
				end: 100,
				height: 19,
			}, {
				type: 'inside',
			}],
			series: [{
				name: ' ',
				type: 'line',
				smooth: true,
				//symbol: 'none',//去掉小圆点
				sampling: 'average',
				itemStyle: {
					normal: {
						color: '#4B64A2'
					}
				},
				areaStyle: {
					normal: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
							offset: 0,
							color: '#4b64a2'
						}, {
							offset: 1,
							color: '#5B7AA2'
						}])
					}
				},
				data: areaYDate,
				//[115, 95, 80, 70, 50, 35, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0.5, 0.4, 0.3, 0.2]
			}]
		};
		switch (screenWidth) {
			case 1366:
				areaOption.grid.left = '12.5%';
				areaOption.grid.right = '14%';
				break;
			case 1440:
			case 1400:
				areaOption.grid.left = '13%';
				areaOption.grid.right = '14%';
				break;
			case 1600:
			case 1680:
				areaOption.grid.left = '11.5%';

				break;
			default:
				break;
		}
		areaChart.setOption(areaOption);
	};
	areaChart.on('click', function (param) {
		if ($scope.$page.template[0].id !== 'default') {
			$scope.$page.getAppTypeKpiData(param.name);
			return false;
		}
		$scope.indicators = param.name + '类型流量(GB)';
		let url = APIS.userDefinedArea.appType;
		let param1 = {
			timeInterval: $scope.hourParticles,
			time: startTime,
			area: $scope.selectOuterAreaName,
			appTypeName: param.name,
			appSubTypeName: '全部',
			cityOid: cityId
		};
		setOption(url, param1);
	})

	/**右下半部分双向柱形图*/
	/**业务大类选项*/
	$scope.businessBigTypeList = ['全部', '浏览下载', '邮箱', '出行旅游', '应用商店', '即时通信', '彩信',
		'其他', '网盘云服务', '视频', '导航', '音乐', '游戏', '阅读', '财经', '安全杀毒', 'VoIP业务', '支付',
		'动漫', 'P2P业务', '微博社区', '购物'
	];
	/**默认的业务大类*/
	$scope.selectBigType = '全部';
	/**点击业务大类切换业务类型并请求接口*/
	$scope.selectBusinessBigType = (businessBigType) => {
		$scope.selectBigType = businessBigType;
		getBigType($scope.selectBigType);
	}


	/**点击人员查询显示表格*/
	let cellTemplate = `
    <div class="ngCellText ui-grid-cell-contents" style="padding:0 15px;">
         <span style="float:left">{{COL_FIELD CUSTOM_FILTERS}}</span>
         <span class="blue"  ng-click="grid.appScope.getChart(row.entity.attribution,row.entity.userAttribute)" >
             <i class="fa fa-line-chart indicator-chart-icon"></i>
         </span>
    </div>
    `;
	let cellTemplate1 = `
    <div class="ngCellText ui-grid-cell-contents" style="padding:0 15px;text-align:center;">
         <span>{{COL_FIELD CUSTOM_FILTERS}}</span>
    </div>
    `;

	let rowTemplate = `
     <div ng-mouseover="rowStyle={'background-color': '#D3F1FF'}; grid.appScope.onRowHover(this);" ng-mouseleave="rowStyle={}">
     <div  ng-style="rowStyle" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + '-' + col.uid + '-cell'"
     class="ui-grid-cell" ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader }" role="{{col.isRowHeader ? 'rowheader' : 'gridcell'}}" ui-grid-cell>
     </div></div>
     `;

	/**初始化人员来源分析表*/
	const initPeopleGrid = () => {
		$scope.peopleGridOptions = {
			rowTemplate: rowTemplate,
			rowHeight: 30,
			columnDefs: [{
					name: 'queryTime',
					displayName: '时间段',
					cellTemplate: cellTemplate1,
					width: 168,
					cellFilter: 'formatUserDefineTime:this'
				},
				{
					name: 'area',
					displayName: '自定义区域',
					cellTemplate: cellTemplate1
				},
				{
					name: 'attribution',
					displayName: '归属地来源',
					cellTemplate: cellTemplate1
				},
				{
					name: 'userAttribute',
					displayName: '用户属性',
					cellTemplate: cellTemplate1
				},
				{
					name: 'userCount',
					displayName: '人数',
					cellTemplate: cellTemplate,
					type: 'number'
				},
			],
			enableSorting: true, //是否支持排序(列)
			enableHorizontalScrollbar: 1, //表格的水平滚动条
			enableVerticalScrollbar: 1, //表格的垂直滚动条 (两个都是 1-显示,0-不显示)
			//exporterCsvFilename: '自定义区域分析表.csv',
			exporterOlderExcelCompatibility: true,
		};
		$scope.peopleGridOptions.appScopeProvider = $scope;
		$scope.peopleGridOptions.onRegisterApi = function (gridApi) {
			$scope.gridApi = gridApi;
		};
		/***导出数据*/
		/*let getAttributionData = function () {
		 return new Promise((resolve, reject) => {
		 let url = APIS.userDefinedArea.numberAttribution;
		 let param = {
		 timeSlot: startTime,
		 areaName: $scope.selectOuterAreaName,
		 timeInterval: $scope.hourParticles,
		 };
		 HttpRequestService.get(url, param, response => {
		 $scope.peopleGridOptions.data = [];
		 angular.forEach(response, function (row) {
		 $scope.peopleGridOptions.data.push(row);
		 });
		 resolve();
		 }, () => {
		 reject();
		 });
		 });
		 };*/
		/***触发导出全部数据*/
		$scope.exportTrendToCsv = () => {
			/*if ($scope.peopleGridOptions.data.length === 0) {
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
			 $scope.gridApi.exporter.csvExport('all', 'all');*/
			let url = APIS.userDefinedArea.exportNumberAttribution;
			let params = {
				timeSlot: startTime,
				areaName: $scope.selectOuterAreaName,
				timeInterval: $scope.hourParticles,
				cityOid: cityId,
				fileName: '自定义区域分析表',
			};
			window.location = url + '?timeSlot=' + params.timeSlot + '&areaName=' + params.areaName + '&timeInterval=' + params.timeInterval + '&fileName=' + params.fileName + '&cityOid=' + params.cityOid;

		};

	};


	/**同比环比分析*/
	let ChainChart = echarts.init(document.getElementById('ChainChart'));
	let sameCompareChart = echarts.init(document.getElementById('sameCompareChart'));
	let ChainOption = {};
	let sameCompareOption = {};
	/**初始化同比环比*/
	const initBarAndLineChart = () => {
		//指定图标的配置和数据
		ChainOption = {
			title: {
				text: '环比',
				subtext: ' ',
				left: 'center',
				textStyle: {
					fontSize: 20,
				},
			},
			grid: {
				top: 75, //距离容器上边界40像素
				bottom: 105, //距离容器下边界30像素
			},
			tooltip: {
				formatter: '{a}<br/>日期：{b}<br/>数值：{c}',
			},
			legend: {
				top: 41,
				left: 200,
				itemWidth: 15,
				itemHeight: 10,
			},
			xAxis: {
				type: 'category',
				//name: "日期",
				data: [''],
				axisLabel: {
					interval: 0,
					rotate: 45,
					textStyle: {
						fontSize: 11,
					},
				},
			},
			yAxis: {
				name: '数量',
				scale: true,
				axisLabel: {
					rotate: 45,
					textStyle: {
						fontSize: 11,
					},
					formatter(value) {
						return formatNum(value);
					}
				},
				boundaryGap: [0.01, 0.05]
			},
			dataZoom: [{
				show: true,
				realtime: true,
				start: 40,
				end: 100,
				height: 20,
			}, {
				type: 'inside',
			}],
			series: [{
				name: '区域',
				type: 'bar',
				barWidth: '60%',
				data: [],
			}, {
				name: '全市',
				type: 'line',
				data:[],
			}, {
				name: '全省',
				type: 'line',
				data:[],
			}],
		};
		sameCompareOption = {
			title: {
				text: '同比',
				subtext: ' ',
				left: 'center',
				textStyle: {
					fontSize: 20,
				},
			},
			grid: {
				top: 75, //距离容器上边界40像素
				bottom: 105, //距离容器下边界30像素
			},
			tooltip: {
				formatter: '{a}<br/>日期：{b}<br/>数值：{c}',
			},
			legend: {
				top: 41,
				left: 200,
				itemWidth: 16,
				itemHeight: 10,
			},
			xAxis: {
				type: 'category',
				//name: "日期",
				data: [],
				axisLabel: {
					interval: 0,
					rotate: 45,
					textStyle: {
						fontSize: 11,
					},
				},
			},
			yAxis: {
				name: '数量',
				scale: true,
				axisLabel: {
					rotate: 45,
					textStyle: {
						fontSize: 11,
					},
					formatter(value) {
						return formatNum(value);
					},
					boundaryGap: [0.01, 0.05]
				},
			},
			dataZoom: [{
				show: true,
				realtime: true,
				start: 0,
				end: 100,
				height: 20,
			}, {
				type: 'inside',
			}],
			series: [{
				name: '区域',
				type: 'bar',
				barWidth: '60%',
				data: [],
			}, {
				name: '全市',
				type: 'line',
				data:[],
			}, {
				name: '全省',
				type: 'line',
				data:[],
			}],
		};
		//使用制定的配置项和数据显示图表
		ChainChart.setOption(ChainOption);
		sameCompareChart.setOption(sameCompareOption);
	};

	/**同环比接口*/
	//将时间戳转换成日期
	const chartDate = (timestamp) => {
		let time = new Date(timestamp);
		let year = time.getFullYear();
		let month = time.getMonth() + 1;
		let monthStr = month < 10 ? ('0' + month) : (month + '');
		let date = time.getDate();
		let dateStr = date < 10 ? ('0' + date) : (date + '');
		let hour = time.getHours();
		let hourStr = hour < 10 ? ('0' + hour) : (hour + '');
		if ($scope.timeParticles === '小时') {
			ChainOption.dataZoom[0].start = 30;
			return monthStr + "-" + dateStr + "  " + hourStr + ":00";
		} else if ($scope.timeParticles === '天') {
			ChainOption.dataZoom[0].start = 30;
			return year + "-" + monthStr + "-" + dateStr;
		}
	}

	/**建立一个渲染同环比图公共函数*/
	const setOption = (url, param, indicators) => {
		$scope.queryChartMessage = $scope.selectedTime + ' ' + $scope.selectOuterAreaName + ' ' + (indicators ? indicators : $scope.indicators) + '趋势分析';
		ChainOption.xAxis.data = [];
		ChainOption.series[0].data = [];
		ChainOption.series[0].name = '';
		ChainOption.legend.data = [];
		sameCompareOption.xAxis.data = [];
		sameCompareOption.series[0].data = [];
		sameCompareOption.series[0].name = '';
		sameCompareOption.legend.data = [];
		ChainChart.setOption(ChainOption);
		sameCompareChart.setOption(sameCompareOption);
		$('#myEchartsModal').modal();
		HttpRequestService.get(url, param, response => {
			let huanBiTime = [];
			let huanBiValue = [];
			let tongBiTime = [];
			let tongBiValue = [];
			const huanbiData = response.huanbi || [],
			tongbiData = response.tongbi || [];
			for (let i = 0; i < huanbiData.length; i++) {
				huanBiTime.push(chartDate(huanbiData[i].time));
				huanBiValue.push(huanbiData[i].value);
			}
			for (let i = 0; i < tongbiData.length; i++) {
				tongBiTime.push(chartDate(tongbiData[i].time));
				tongBiValue.push(tongbiData[i].value);
			}

			if ($scope.timeParticles === '小时') {
				ChainOption.dataZoom[0].start = 40;
			} else if ($scope.timeParticles === '天') {
				ChainOption.dataZoom[0].start = 0;
			}
			ChainOption.xAxis.data = huanBiTime;
			ChainOption.series[0].data = huanBiValue;
			ChainOption.series[0].name = '区域';//$scope.indicators;
			//ChainOption.legend.data = [$scope.indicators];
			sameCompareOption.xAxis.data = tongBiTime;
			sameCompareOption.series[0].data = tongBiValue;
			sameCompareOption.series[0].name = '区域';//$scope.indicators;
			//sameCompareOption.legend.data = [$scope.indicators];
			// 自定义同环比配置
			$scope.$page.setCompareConfig(ChainOption, sameCompareOption, response, param);
			ChainChart.setOption(ChainOption);
			sameCompareChart.setOption(sameCompareOption);
		})
	}

	/**1.区域人数接口*/
	const getTypeAreaNumber = (id, selectIdForArea) => {
		$(id).click(() => {
			$scope.indicators = selectIdForArea + '人数(人)';
			let url = APIS.userDefinedArea.areaSubscriberCount;
			let param = {
				timeInterval: $scope.hourParticles,
				time: startTime,
				area: $scope.selectOuterAreaName,
				selectIdForArea: selectIdForArea,
				cityOid: cityId
			};
			setOption(url, param)
		})
	}
	getTypeAreaNumber('#provinceNumber', '省内');
	getTypeAreaNumber('#MacaoNumber', '港澳台');
	getTypeAreaNumber('#interProvincialNumber', '省际');
	getTypeAreaNumber('#internationalNumber', '国际');
	getTypeAreaNumber('#areaCountNumber', '总');
	getTypeAreaNumber('#areaCountNumber4G', '4G');
	getTypeAreaNumber('#areaCountNumber3G', '3G');
	getTypeAreaNumber('#areaCountNumber2G', '2G');


	/**2.区域总流量接口*/
	const getCountFlowNumber = (id, selectId) => {
		$(id).click(() => {
			$scope.indicators = '总流量(GB)';
			let url = APIS.userDefinedArea.nineLteAndfourKeyIndicators;
			let param = {
				timeInterval: $scope.hourParticles,
				time: startTime,
				area: $scope.selectOuterAreaName,
				selectId: selectId,
				cityOid: cityId
			};
			setOption(url, param)
		})
	}
	getCountFlowNumber('#areaCountFlow', 13);

	/**3.归属地同环比接口*/
	/**点击表格中的按钮加载图表数据*/
	$scope.getChart = (attribution, userProperty) => {
		$scope.indicators = '归属地为' + attribution + '的人数(人)';
		let url = APIS.userDefinedArea.attribution;
		let param = {
			timeInterval: $scope.hourParticles,
			time: startTime,
			area: $scope.selectOuterAreaName,
			attribution: attribution,
			userProperty: userProperty,
			cityOid: cityId
		};
		setOption(url, param)
	};

	/**4.9个LTE指标以及4个重要指标的时粒度的接口*/
	let LTEName = ['HTTP下载速率', '浏览响应时延', '浏览响应成功率', '游戏响应时延', '游戏响应成功率',
		'视频响应时延', '视频响应成功率', '即时通信响应时延', '即时通信响应成功率'
	]
	$('.progressCharts .value').click(function() {
		const selectId = parseInt($(this).attr('data-index')), unit = $(this).attr('data-unit');
		$scope.indicators = LTEName[selectId] + unit;
		let url = APIS.userDefinedArea.nineLteAndfourKeyIndicators;
		let param = {
			timeInterval: $scope.hourParticles,
			time: startTime,
			area: $scope.selectOuterAreaName,
			selectId: selectId,
			cityOid: cityId
		};
		setOption(url, param)
	});

	/**升级select选择框*/
	/**select插件内容翻译*/
	$scope.selectorText = {
		checkAll: '选择全部',
		unchenkAll: '取消全部',
		buttonDefaultText: '请选择或配置区域',
		dynamicButtonTextSuffix: '个选择',
		searchPlaceholder: '搜索'
	}
	/**自定义区域选择设置*/
	$scope.outerAreaSelectedModel = [];
	$scope.outerAreaSelectedSetting = {
		scrollableHeight: '249px',
		showCheckAll: false,
		showUncheckAll: false,
		scrollable: true,
		enableSearch: true,
		selectionLimit: 1,
		idProperty: 'id',
		displayProp: 'name',
		searchField: 'name',
		closeOnSelect: true,
		buttonClasses: 'btn btn-default textLeft blueBorder',
		smartButtonTextProvider(selectionArray) {
			return selectionArray[0].name;
		},
	}
	$scope.outerAreaSelectedEvents = {
		onItemSelect: item => {
			$scope.selectOuterAreaName = item.name;
		},
		onItemDeselect: () => {
			$scope.selectOuterAreaName = '';
		},
	}

	/**配置中自定义区域选择设置*/
	$scope.areaSelectedModel = [];
	$scope.areaSelectedSetting = {
		scrollableHeight: '228px',
		showCheckAll: false,
		showUncheckAll: false,
		scrollable: true,
		enableSearch: true,
		selectionLimit: 1,
		idProperty: 'id',
		displayProp: 'name',
		searchField: 'name',
		closeOnSelect: true,
		buttonClasses: 'selectedArea',
		smartButtonTextProvider(selectionArray) {
			return selectionArray[0].name;
		},
	}
	$scope.areaSelectedEvents = {
		onItemSelect: item => {
			$scope.selectAreaName = item.name;
			Loading.isLoading('#getCellListByArea');
			/**请求该区域的小区*/
			let url = APIS.userDefinedArea.getCellListByArea;
			HttpRequestService.get(url, {
				pageIndex: 0,
				pageSize: -1,
				areaName: $scope.selectAreaName,
				cityOid: cityId
			}, response => {
				selectedCellElementIdSet = new Set();
				$scope.selectedCellElementList = response;
				Loading.hideLoading('#getCellListByArea');
				for (let i = 0; i < $scope.selectedCellElementList.length; i++) {
					selectedCellElementIdSet.add($scope.selectedCellElementList[i]);
				}
			}, () => {
				Loading.hideLoading('#getCellListByArea');
			});
		},
		onItemDeselect: () => {
			$scope.selectAreaName = '';
			$scope.selectedCellElementList = '';
		},
	}

	/**模板选择*/
	//$scope.templateOptions=['默认模板','模板1','模板2','模板3','模板4','模板5'];
	$scope.selectorTemplateDelete = {
		checkAll: '删除模板',
		uncheckAll: '取消全部',
		buttonDefaultText: '选择模板',
		dynamicButtonTextSuffix: '个选择',
		searchPlaceholder: '搜索',
		deleteItemText: '删除模板',
	};
	$scope.templateSetting = {
		scrollableHeight: '249px',
		showCheckAll: false,
		showUncheckAll: false,
		scrollable: true,
		enableSearch: true,
		selectionLimit: 1,
		idProperty: 'id',
		displayProp: 'name',
		searchField: 'name',
		closeOnSelect: true,
		enableDelete: true,
		buttonClasses: 'btn btn-default select-width-140',
		smartButtonTextProvider(selectionArray) {
			return selectionArray[0].name;
		},
	};

	/** 初始化加载Controller */
	const initController = () => {
		//初始化时间
		initDatetimepicker();
		//keyCharts();
		initAreaChart();
		initPeopleGrid();
		initBarAndLineChart();
		$scope.getOuterAreaElementList();
		$scope.getAreaElementList();
		resizeContainer();
		echarts.init(document.getElementById('response_success_rate_chart'));
		echarts.init(document.getElementById('download_speed_chart'));
		echarts.init(document.getElementById('upload_speed_chart'));
	};
	initController();

	/**业务小类tab栏切换*/
	$('#myTabs a').click(function (e) {
		e.preventDefault();
		$(this).tab('show')
	});

	// 2018.7.23 需求更改
	$scope.$page = new NewUserDefineArea(arguments);
	$scope.setOption = setOption;
	$scope.startTime = startTime;
	$scope.cityId = cityId;
	$scope.areaChart = areaChart;
	$scope.areaOption = areaOption;
}

UserDefinedAreaAnalysisController.$inject = ['$scope', '$sce', '$filter', 'HttpRequestService', 'UserDefineAreaTemplateService'];
