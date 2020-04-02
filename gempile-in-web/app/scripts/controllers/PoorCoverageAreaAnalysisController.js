'use strict';

import APIS from '../configs/ApisConfig';
import Flatpickr from 'flatpickr';
import Loading from '../custom-pulgin/Loading';
import swal from 'sweetalert2';

/**
 * ControlPanelController
 *
 * @export
 * @param $scope
 * @param $filter
 * @param HttpRequestService
 */
export default function PoorCoverageAreaAnalysisController($scope, $filter, HttpRequestService) {
	/** 查询状态信息，显示在地图头部 */
	$scope.queryStatusMessage = '无';
	/**默认显示表格*/
	$scope.tableAnalysis = true;
	$scope.mapGisAnalysis = false;
	/**选择日期时段地区的默认值*/
	$scope.selDate = '';
	$scope.timeSlot = '';
	$scope.selArea = '';
	/**初始时间值*/
	let startTime;
	let endTime;
	let timeSlots;
	/***记录当前规则表的页面*/
	// let curPageIndex = 1;
	// let curPageSize = 10;

	/*重置地图瓦片路径*/
	mapConfig.tilesDir = mapConfig.home + 'tiles/huizhou';

	/** 屏幕分辨率宽度 */
	let screenWidth = window.screen.width;

	$(document).ready(() => {
		$scope.tableAnalysis = false;
		Loading.hideLoading('.table_show');
	});

	/** 点击图标显示或隐藏表格*/
	$scope.showTable = () => {
		$scope.tableAnalysis = !$scope.tableAnalysis;
	};

	/***切换全屏模式***/
	$scope.fullPage = () => {
		$('#map_gis_analysis').addClass('full_screen');
		$('.click_loading').hide();
		$('.close_full_screen').show();
		$('.table_show').hide();
		$('.big_map').css('height', '115%');
		switch (screenWidth) {
			case 1366:
				$('.big_map').css('height', '143%');
				break;
		}
	};
	$scope.noFullScreen = () => {
		$('#map_gis_analysis').removeClass('full_screen');
		$('.click_loading').show();
		$('.close_full_screen').hide();
		$('.table_show').show();
		$('.big_map').css('height', '105%');
	};

	/**初始化时间控件*/
	const initDatetimepicker = function initDatetimepicker() {
		let startDatePicker = null;

		let startPickerConfig = {
			maxDate: new Date(),
		};
		$(document).ready(() => {
			startDatePicker = new Flatpickr(document.querySelector('.selDate'), startPickerConfig);
			//Loading.hideLoading('.table_show');
		})
	};

	/***点击查询之后将数据保存***/
	let inquireData = [];
	let AraeCenterlng = '';
	let AraeCenterlat = '';

	/***初始化地图****/
	let map;
	map = new BMap.Map('bigMap', {
		minZoom: 12,
		maxZoom: 15,
	});
	map.centerAndZoom(new BMap.Point(114.419185, 23.080332), 13);
	map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT})); //缩放按钮{anchor: BMAP_ANCHOR_TOP_RIGHT}
	map.addControl(new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_RIGHT}));//添加比例尺{anchor: BMAP_ANCHOR_TOP_RIGHT}
	map.enableScrollWheelZoom(true);

	/*var point = new BMap.Point(114.419185, 23.080332);
	var marker = new BMap.Marker(point);  // 创建标注
	map.addOverlay(marker)*/

	/** *********1.点击查询按钮，触发刷新参数 *************************************************/
	$scope.toPoorAreaGisAnalysis = () => {
		//让按钮不可点击
		$('#toPoorAreaGisAnalysis').attr('disabled', true);
		Loading.isLoading('.map_gis_analysis');
		Loading.isLoading('.table_show');
		//清空范围
		try {
			BMapLib.AreaRestriction.clearBounds();
		} catch (e) {
			swal('', e, 'error');
		}
		if ($scope.selDate === '') {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择时间!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			$('#toPoorAreaGisAnalysis').attr('disabled', false);
			Loading.hideLoading('.map_gis_analysis');
			return;
		}
		if ($scope.timeSlot === '' || $scope.timeSlot === null) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择时间段!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			$('#toPoorAreaGisAnalysis').attr('disabled', false);
			Loading.hideLoading('.map_gis_analysis');
			return;
		}
		if ($scope.selArea === '' || $scope.selArea === null) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择区域!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			$('#toPoorAreaGisAnalysis').attr('disabled', false);
			Loading.hideLoading('.map_gis_analysis');
			return;
		}
		/***将时间日期转换成时间戳**/
		let startDate = ($scope.selDate).replace(/-/g, '/') + ' ' + $scope.timeSlot + ':00:00';
		let endDate = ($scope.selDate).replace(/-/g, '/') + ' ' + (+$scope.timeSlot + 1) + ':00:00';
		let date1 = new Date(startDate);
		let date2 = new Date(endDate);
		startTime = date1.getTime();
		endTime = date2.getTime();
		timeSlots = startTime + ',' + endTime;

		/**请求数据并将数据保存*/
			//let url = basePath + "/v1.4/gisAnalysis/weakCoverageArea/hz/kpiList";
		let url = APIS.poorAreaGis.getPoorAreaGisAnalysis;
		HttpRequestService.get(url, {
			timeSlots,
			area: $scope.selArea,
			pageIndex: 0,
			pageSize: -1,
		}, response => {
			/**保存数据*/
			inquireData = response.weakCoverageAreaKpiHzList;
			AraeCenterlng = response.longitude;
			AraeCenterlat = response.latitude;

			if (response.totalCount === 0) {
				swal({
					showCloseButton: true,
					title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
					text: '没有获取到数据，请重新查询!',
					allowOutsideClick: false,
					confirmButtonText: '确定',
					confirmButtonClass: 'sure-class',
				});
				$('#toPoorAreaGisAnalysis').attr('disabled', false);
				Loading.hideLoading('.map_gis_analysis');
				return;
			}
			/**页面显示查询信息*/
			$scope.queryStatusMessage = `${$scope.selDate}，1小时粒度，${$scope.selArea}`;

			/**隐藏exit按钮*/
			$('.exit').hide();
			$('.gis_type').hide();

			/***点击查询之后将地图中的覆盖物和表格数据全部清除重新加载数据***/
			map.clearOverlays();

			/**显示表格并添加数据*/
			//$scope.mapGisAnalysis = true;
			$scope.tableAnalysis = true;
			$scope.gisGridOptions.data = [];
			$scope.gisGridOptions.totalItems = 0;
			$scope.gisGridOptions.totalItems = response.totalCount;
			angular.forEach(response.weakCoverageAreaKpiHzList, row => {
				$scope.gisGridOptions.data.push(row);
			});
			/****多次点击查询时重置地图*/
			map.setMinZoom(12);
			map.setMaxZoom(15);
			map.centerAndZoom(new BMap.Point(AraeCenterlng, AraeCenterlat), 13);

			//开始地图隐藏再点开时只显示左上角，所以用此代码
			// let loadCount = 1;
			// map.addEventListener("tilesloaded", function () {
			//     if (loadCount == 1) {
			//         map.setCenter(new BMap.Point(AraeCenterlng,AraeCenterlat));
			//     }
			//     loadCount = loadCount + 1;
			// });

			/**添加圆形覆盖物*/
			drawCirclesFromData();
			Loading.hideLoading('.map_gis_analysis');
			Loading.hideLoading('.table_show');
			$('#toPoorAreaGisAnalysis').attr('disabled', false);
		}, () => {
			$('#toPoorAreaGisAnalysis').attr('disabled', false);
			Loading.hideLoading('.map_gis_analysis');
			Loading.hideLoading('.table_show');
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '没有获取到数据，请重新查询!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			$scope.gisGridOptions.data = [];
			map.clearOverlays();
			/****多次点击查询时重置地图*/
			map.setMinZoom(12);
			map.setMaxZoom(15);
			map.centerAndZoom(new BMap.Point(114.419185, 23.080332), 13);
		});
	};

	// map.addEventListener("click", function showInfo(e) {
	//     alert(e.point.lng + ", " + e.point.lat);
	// });


	/****重置地图大小*******/
	// const resizeMap = (maxZoom, minZoom, zoom, centerLongitude, centerLatitude)=>{
	//     map.reset();
	//     map.setMaxZoom(maxZoom);
	//     map.setMinZoom(minZoom);
	//     map.setZoom(zoom);
	//     map.clearOverlays();
	//     let resetPoint = new BMap.Point(centerLongitude, centerLatitude);
	//     map.panTo(resetPoint);
	// };

	/***画单个圆的函数***/
	const addCircle = (point, radius, fillColor, strokeColor, fillOpacity) => new BMap.Circle(point, radius, {
		strokeColor,
		strokeWeight: 2,
		fillColor,
		fillOpacity,
	});

	/**点击圆圈之后重新画小的圆圈**/
	const drawSingleSmallCircle = i => {
		let smallPoint = new BMap.Point(inquireData[i].centralLongitude, inquireData[i].centralLatitude);
		let smallCircle = addCircle(smallPoint, inquireData[i].radius, 'red', 'pink', 0.2);
		map.addOverlay(smallCircle);
	};
	/**根据返回的经纬度画出多个小圆圆**/
	const drawSmallCirclesFromData = () => {
		for (let i = 0; i < inquireData.length; i++) {
			drawSingleSmallCircle(i);
		}
	};

	/**画外面单个圆并给其添加点击事件**/
	const drawSingleCircle = i => {
		let point = new BMap.Point(inquireData[i].centralLongitude, inquireData[i].centralLatitude);
		let circle = addCircle(point, inquireData[i].radius * 3, 'pink', 'pink', 0.6);
		map.addOverlay(circle);
		circle.addEventListener('click', event => {
			$('.exit').attr('disabled', true);
			$('#toPoorAreaGisAnalysis').attr('disabled', true);
			/**重新设置地图中心点和级别并清除之前的圆形*/
			map.setMaxZoom(19);
			map.setMinZoom(17);
			//map.centerAndZoom(point, 18);
			map.clearOverlays();
			map.setViewport({
				center: point,
				zoom: 18,
			}, {enableAnimation: false});
			/**获取点击的圆形的经纬度,可用于地图定位*/
			let center = event.target.getCenter();
			let clickedRadius = (event.target.getRadius()) / 3;
			let clickedCenterLng = center.lng;
			let clickedCenterLat = center.lat;
			/***做一个选中的效果***/
			let clickedPoint = new BMap.Point(clickedCenterLng, clickedCenterLat);
			let clickedCircle = addCircle(clickedPoint, clickedRadius, 'blue', 'red', 0.1);
			map.addOverlay(clickedCircle);
			/**重新画一个小半径的圆*/
			drawSmallCirclesFromData();
			/**显示exit按钮*/
			$('.exit').show();
			$('.gis_type').show();
			/**获取数据并画扇形和点*/
			getSectorData(clickedCenterLng, clickedCenterLat);

			/**限制拖动范围*/
			clickedCircle.setRadius(3000);
			try {
				BMapLib.AreaRestriction.setBounds(map, clickedCircle.getBounds());
				clickedCircle.setRadius(clickedRadius);
			} catch (e) {
				swal('', e, 'error');
			}
		});
	};
	/**根据返回的经纬度画出多个圆**/
	const drawCirclesFromData = () => {
		for (let i = 0; i < inquireData.length; i++) {
			drawSingleCircle(i);
		}
	};

	/**********2.点击之后获取数据并添加画扇形和点的函数****************************************/
	let PoorGisData = [];
	const getSectorData = (clickedCenterLng, clickedCenterLat) => {
		//let url = basePath + "/v1.4/gisAnalysis/weakCoverageArea/hz/xdrListAndCellInfo";
		let url = APIS.poorAreaGis.getSectorData;
		Loading.isLoading('.table_show');
		HttpRequestService.get(url, {
			timeSlots,
			area: $scope.selArea,
			longitude: clickedCenterLng,
			latitude: clickedCenterLat,
		}, response => {
			PoorGisData = response.xdrAndCellListHzList;
			let sectorData = response.cellInfoList;
			$scope.gisGridOptions.data = [];//清空表格记录
			$scope.gisGridOptions.data.push(response.weakCoverageAreaKpiHz);
			drawPoints();
			//drawSectors(sectorData);
			/***分线程加载扇形***/
			let everyLength = Math.floor(sectorData.length / 5);
			//切割数组的函数
			let split_array = (arr, everyLen) => {
				let a_len = arr.length;
				let newData = [];
				for (let i = 0; i < a_len; i += everyLen) {
					newData.push(arr.slice(i, i + everyLen));
				}
				return newData;
			};
			let newSectorData = split_array(sectorData, everyLength);
			for (let i = 0; i < newSectorData.length; i++) {
				setTimeout(() => {
					drawSectors(newSectorData[i]);
				}, 50);
			}
			Loading.hideLoading('.table_show');
			$('.exit').attr('disabled', false);
			$('#toPoorAreaGisAnalysis').attr('disabled', false);
		}, () => {
			$('.exit').attr('disabled', false);
			$('#toPoorAreaGisAnalysis').attr('disabled', false);
			Loading.hideLoading('.table_show');
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '没有获取到数据！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
		});
	};

	/****画大量点*/
	// function drawPoints() {
	//     for (let i = 0; i < PoorGisData.length; i++) {
	//         let redPoints = PoorGisData[i].redUeMrXdrHzList;
	//         for (let k = 0; k < redPoints.length; k++) {
	//             let myIcon = new BMap.Icon("./images/square11.jpg", new BMap.Size(3, 3));
	//             let point = new BMap.Point(redPoints[k].locationLongitude, redPoints[k].locationLatitude);
	//             let marker = new BMap.Marker(point, {icon: myIcon});
	//             map.addOverlay(marker);
	//         }
	//     }
	// }

	/***画海量点**/
	const drawPoints = () => {
		for (let i = 0; i < PoorGisData.length; i++) {
			let redPoints = PoorGisData[i].redUeMrXdrHzList;
			if (document.createElement('canvas').getContext) { // 判断当前浏览器是否支持绘制海量点
				let points = []; // 添加海量点数据
				for (let k = 0; k < redPoints.length; k++) {
					points.push(new BMap.Point(redPoints[k].locationLongitude, redPoints[k].locationLatitude));
				}
				let options = {
					size: BMAP_POINT_SIZE_TINY,
					shape: BMAP_POINT_SHAPE_CIRCLE,
					color: 'red',
				};
				let pointCollection = new BMap.PointCollection(points, options); // 初始化PointCollection
				/*pointCollection.addEventListener('click', e => {
				 alert('单击点的坐标为：' + e.point.lng + ',' + e.point.lat); // 监听点击事件
				 });*/
				map.addOverlay(pointCollection); // 添加Overlay
			} else {
				alert('请在chrome、safari、IE8+以上浏览器查看本示例');
			}
		}
	};

	/***画扇形*/
	const drawSectors = sectorData => {
		for (let i = 0; i < sectorData.length; i++) {
			let cellList = sectorData[i];
			for (let j = 0; j < cellList.length; j++) {
				let centralLongitude = cellList[j].actualMeasureLongitude;
				let centralLatitude = cellList[j].actualMeasureLatitude;
				let cellInfo = cellList[j].cellInfo;
				let strokeOpacity = cellList[j].sameCellCount * 0.15;
				let fillOpacity = cellList[j].sameCellCount * 0.25;
				drawOneSector(centralLongitude, centralLatitude, (cellList[j].startAzimuth),
					(cellList[j].endAzimuth), strokeOpacity, cellInfo, fillOpacity);
			}
		}
	};

	/***画扇形的函数*/
	const drawOneSector = (lng, lat, sDegree, eDegree, strokeOpacity, cellInfo, fillOpacity) => {
		/** 先画一个扇形*/
		let point1 = new BMap.Point(lng, lat);
		let polygon = generaSector(point1, 50, sDegree, eDegree, 'black', 1, strokeOpacity, '#63BFF9', fillOpacity);
		map.addOverlay(polygon);
		/***设置不同的显示位置*/
		let width = 0;
		let height = 0;
		if (eDegree < 45) {
			width = 25;
			height = -45;
		} else if (eDegree < 90) {
			width = 45;
			height = -20;
		} else if (eDegree < 135) {
			width = 45;
			height = 20;
		} else if (eDegree < 180) {
			width = 25;
			height = 45;
		} else if (eDegree < 225) {
			width = -225;
			height = 45;
		} else if (eDegree < 270) {
			width = -245;
			height = 20;
		} else if (eDegree < 315) {
			width = -245;
			height = -20;
		} else {
			width = -250;
			height = -45;
		}
		/****鼠标经过显示小区信息*/
		let cellLabel = new BMap.Label(cellInfo, {
			offset: new BMap.Size(width, height),
			position: point1,
		});
		cellLabel.setStyle({
			'z-index': '99',
			'padding': '5px',
			'width': '200px',
			'border': '1px solid #ccff00',
			'cursor': 'pointer',
			'white-space': 'pre-line',
		});
		polygon.addEventListener('mouseover', () => {
			map.addOverlay(cellLabel);
		});
		polygon.addEventListener('mouseout', () => {
			map.removeOverlay(cellLabel);
		});

		/*********生成扇形方法
		 point 扇形中心点   radius 扇形半径   sDegree 扇形开始角度（0-360）  eDegree 扇形结束角度（0-360）
		 **********/
		function generaSector(point, radius, sDegree, eDegree, strokeColour, strokeWeight, StrokeOpacity, fillColour, fillOpacity, opts) {
			let points = [];
			let step = ((eDegree - sDegree) / 10) || 10;
			points.push(point);
			for (let i = sDegree; i < eDegree + 0.001; i += step) {
				points.push(EOffsetBearing(point, radius, i));
			}
			points.push(point);
			//Polygon方法接受大量点后，可以合成任意图形
			let polygon = new BMap.Polygon(points, {
				strokeColor: strokeColour,
				strokeWeight,
				strokeOpacity: StrokeOpacity,
				fillColor: fillColour,
				fillOpacity,
			});
			return polygon;
		}

		function EOffsetBearing(point3, dist, bearing) {
			let latConv = map.getDistance(point3, new BMap.Point(point3.lng + 0.1, point3.lat)) * 10.8;
			let lngConv = map.getDistance(point3, new BMap.Point(point3.lng, point3.lat + 0.1)) * 9.3;
			let lat = dist * Math.cos(bearing * Math.PI / 180) / latConv;
			let lng = dist * Math.sin(bearing * Math.PI / 180) / lngConv;
			return new BMap.Point(point3.lng + lng, point3.lat + lat);
		}
	};

	/**点击exit按钮回到刚开始的地图*/
	$scope.showBigMap = () => {
		$('#toPoorAreaGisAnalysis').attr('disabled', true);
		/**重置地图*/
		map.setMinZoom(12);
		map.setMaxZoom(15);
		map.centerAndZoom(new BMap.Point(AraeCenterlng, AraeCenterlat), 13);
		map.clearOverlays();
		/**重置加载表格*/
		getPoorGisList();
		/**重置画圆*/
		drawCirclesFromData();
		/**隐藏exit按钮*/
		$('.exit').hide();
		$('.gis_type').hide();
		/**清除可视范围***/
		try {
			BMapLib.AreaRestriction.clearBounds();
		} catch (e) {
			swal('', e, 'error');
		}
	};

	/********3.表格数据**********************************************/
	let cellTemplate = `
    <div class="ngCellText ui-grid-cell-contents" style="padding-left:10px;">
               <div ng-click="grid.appScope.rowClick(row)">{{COL_FIELD}}</div>
               </div>
    `;

	let rowTemplate = `
    <div ng-mouseover="rowStyle={'background-color': '#D3F1FF'}; grid.appScope.onRowHover(this);" ng-mouseleave="rowStyle={}">
<div  ng-style="rowStyle" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + '-' + col.uid + '-cell'"
class="ui-grid-cell" ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader }" role="{{col.isRowHeader ? 'rowheader' : 'gridcell'}}" ui-grid-cell>
</div></div>
    `;

	/**初始化弱覆盖区域分析表*/
	const initPoorGisGrid = () => {
		$scope.gisGridOptions = {
			rowTemplate,
			rowHeight: 30,
			columnDefs: [
				{name: 'startTime', displayName: '时间', cellTemplate},
				{name: 'weakCoverageArea', displayName: '区域', cellTemplate},
				{name: 'centralLongitude', displayName: '中心经度', cellTemplate},
				{name: 'centralLatitude', displayName: '中心纬度', cellTemplate},
				{name: 'radius', displayName: '半径(m)', cellTemplate, type: 'number'},
				{name: 'avgServingRsrp', displayName: '平均RSRP(dBm)', cellTemplate},
				{name: 'avgServingRsrq', displayName: '平均RSRQ(dB)', cellTemplate},
				{name: 'avgTa', displayName: '平均TA', cellTemplate},
				{name: 'avgUlsinr', displayName: '平均UL-SINR(dB)', cellTemplate},
				{name: 'cellCount', displayName: '小区总数', cellTemplate, type: 'number'},
				{name: 'xdrCount', displayName: '弱电平点数量', cellTemplate, type: 'number'},
			],
			enableSorting: true,//是否支持排序(列)
			enableRowSelection: true,// 行选择是否可用
			enableFullRowSelection: true,//是否点击行任意位置后选中,默认为false
			enableSelectAll: true,// 选择所有checkbox是否可用
			multiSelect: true,
			selectionRowHeaderWidth: 35, //default为30,设置选择列的宽度
			//useExternalPagination: true,//是否使用分页按钮
			//paginationPageSizes: [10, 20, 30],
			//paginationPageSize: 10,
			exporterCsvFilename: '弱覆盖区域Gis分析表.csv',
			exporterOlderExcelCompatibility: true,
			//showGridFooter: true,
			exporterAllDataFn () {
				return getGisData()
					.then(() => {
							$scope.gisGridOptions.useExternalPagination = false;
							$scope.gisGridOptions.useExternalSorting = false;
							getGisData = null;
						}
					);
			},
		};

		switch (screenWidth) {
			case 1366:
				$scope.gisGridOptions.rowHeight = 22;
				break;
		}
		$scope.gisGridOptions.appScopeProvider = $scope;
		$scope.gisGridOptions.onRegisterApi = function (gridApi) {
			$scope.gridApi = gridApi;
			// gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
			//     if (getGisData) {
			//         curPageSize = pageSize;
			//         curPageIndex = newPage;
			//         getPoorGisList(curPageIndex, curPageSize);
			//     }
			// });
			// gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
			//     if (getGisData) {
			//         if (sortColumns.length > 0) {
			//             gisGridOptions.sort = sortColumns[0].sort.direction;
			//         } else {
			//             gisGridOptions.sort = null;
			//         }
			//         curPageSize = grid.options.paginationPageSize;
			//         curPageIndex = grid.options.paginationCurrentPage;
			//         getPoorGisList(curPageIndex, curPageSize);
			//     }
			// });
			gridApi.selection.on.rowSelectionChanged($scope, row => {
				$('.exit').attr('disabled', true);
				$('#toPoorAreaGisAnalysis').attr('disabled', true);
				//map.removeEventListener("dragend",rangeRestriction);
				$scope.gisGridOptions.data = [];//清空表格记录
				$scope.gisGridOptions.data.push(row.entity);//获得选中的行信息并添加到表格
				let cellSelectedLongitude = $scope.gisGridOptions.data[0].centralLongitude;
				let cellSelectedLatitude = $scope.gisGridOptions.data[0].centralLatitude;
				let tableRadius = $scope.gisGridOptions.data[0].radius;

				/**点击表格数据后重新渲染地图*/
				map.clearOverlays();
				map.setMaxZoom(19);
				map.setMinZoom(17);
				map.centerAndZoom(new BMap.Point(cellSelectedLongitude, cellSelectedLatitude), 18);

				/**选中的效果*/
				let clickedPoint = new BMap.Point(cellSelectedLongitude, cellSelectedLatitude);
				let tableClickedCircle = addCircle(clickedPoint, tableRadius, 'blue', 'red', 0.1);
				map.addOverlay(tableClickedCircle);

				/**限制拖动范围*/
				tableClickedCircle.setRadius(2000);
				try {
					BMapLib.AreaRestriction.setBounds(map, tableClickedCircle.getBounds());
					tableClickedCircle.setRadius(tableRadius);
				} catch (e) {
					swal('', e, 'error');
				}
				/**重新画一个小半径的圆*/
				drawSmallCirclesFromData();
				/**获取数据并画扇形和点*/
				getSectorData(cellSelectedLongitude, cellSelectedLatitude);
				/**显示exit按钮*/
				$('.exit').show();
				$('.gis_type').show();
				//按钮不可用
			});
		};

		/***导出数据*/
		let getGisData = function () {
			return new Promise((resolve, reject) => {
				let param = {
					timeSlots,
					area: $scope.selArea,
					pageIndex: 0,
					pageSize: -1,
				};
				//let url = basePath + "/v1.4/gisAnalysis/weakCoverageArea/hz/kpiList";
				let url = APIS.poorAreaGis.getPoorAreaGisAnalysis;
				HttpRequestService.get(url, param, response => {
					$scope.gisGridOptions.totalItems = response.totalCount;
					$scope.gisGridOptions.data = [];
					angular.forEach(response.weakCoverageAreaKpiHzList, row => {
						$scope.gisGridOptions.data.push(row);
					});
					resolve();
				}, () => {
					reject();
				});
			});
		};
		/***触发导出全部数据*/
		$scope.exportGisToCsv = () => {
			if ($scope.gisGridOptions.data.length === 0) {
				swal({
					showCloseButton: true,
					title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
					text: '没有数据,请先查询数据！',
					allowOutsideClick: false,
					confirmButtonText: '确定',
					confirmButtonClass: 'sure-class',
				});
				return;
			}
			$scope.gridApi.exporter.csvExport('all', 'all');
		};
	};

	/** 获取弱覆盖区域列表 */
	const getPoorGisList = () => {
		$('#toPoorAreaGisAnalysis').attr('disabled', true);
		Loading.isLoading('.table_show');
		$scope.gisGridOptions.data = [];
		let param = {
			timeSlots,
			area: $scope.selArea,
			pageIndex: 0,
			pageSize: -1,
		};
		//let url = basePath + "/v1.4/gisAnalysis/weakCoverageArea/hz/kpiList";
		let url = APIS.poorAreaGis.getPoorAreaGisAnalysis;
		HttpRequestService.get(url, param, response => {
			$scope.gisGridOptions.totalItems = response.totalCount || 0;
			$scope.gisGridOptions.data = [];
			angular.forEach(response.weakCoverageAreaKpiHzList, row => {
				$scope.gisGridOptions.data.push(row);
			});
			Loading.hideLoading('.table_show');
			$('#toPoorAreaGisAnalysis').attr('disabled', false);
		}, () => {
			Loading.hideLoading('.table_show');
			$('#toPoorAreaGisAnalysis').attr('disabled', false);
		});
	};

	/** 初始化加载Controller */
	const initController = () => {
		//初始化时间
		initDatetimepicker();
		//初始化表格
		initPoorGisGrid();
	};
	initController();
}

PoorCoverageAreaAnalysisController.$inject = ['$scope', '$filter', 'HttpRequestService'];