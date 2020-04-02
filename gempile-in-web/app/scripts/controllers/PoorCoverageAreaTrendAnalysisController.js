/**
 * Created by richstone on 2017/9/28.
 */
'use strict';

import APIS from '../configs/ApisConfig';
import Flatpickr from 'flatpickr';
const echarts = require('echarts');
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
export default function PoorCoverageAreaTrendAnalysisController($scope, $filter, HttpRequestService) {
    /** 查询状态信息，显示在地图头部 */
    $scope.queryStatusMessage = '无';
    /**选择日期时段地区的默认值*/
    $scope.selDate = '';
    $scope.timeSlot = '';
    $scope.selArea = '';
    /**初始时间值*/
    let startTime;
    let endTime;
    let timeSlots;
    /**点击查询之前的状态*/
    $scope.pageSelect = 1;

    /** 屏幕分辨率宽度 */
    let screenWidth = window.screen.width;

    /**初始化时间控件*/
    const initDatetimepicker = function initDatetimepicker() {
        let startDatePicker = null;

        let startPickerConfig = {
            maxDate: new Date(),
        };
        $(document).ready(() => {
            startDatePicker = new Flatpickr(document.querySelector('.selDate'), startPickerConfig);
        })
    };

    /**重新设置图表容器的宽高*/
    let barContainer = document.getElementById('histogramChart');
    let lineContainer = document.getElementById('lineChart');
    const resizeContainer = () => {
        barContainer.style.width = ($('#histogramBox').width()) * 0.93 + "px";
        barContainer.style.height = $('#histogramBox').height() + "px";
        lineContainer.style.width = ($('#lineBox').width()) * 0.93 + "px";
        lineContainer.style.height = $('#lineBox').height() + "px";
    };

    /**屏幕自适应 ——浏览器大小改变时重置图表宽高*/
    $(window).resize(function () {
        resizeContainer();
        let Chart1 = echarts.getInstanceByDom(document.getElementById('histogramChart'));
        let Chart2 = echarts.getInstanceByDom(document.getElementById('lineChart'));
        Chart1.resize();
        Chart2.resize();
    });

    let barChart = echarts.init(document.getElementById('histogramChart'));
    let lineChart = echarts.init(document.getElementById('lineChart'));
    let barOption = {};
    let lineOption = {};
    /**初始化图表*/
    const initChart = () => {
        resizeContainer();
        //指定图标的配置和数据
        barOption = {
            title: {
                text: '环比趋势分析',
                subtext: ' ',
                textStyle: {
                    fontSize: 20,
                }
            },
            grid: {
                top: 100,//距离容器上边界40像素
                bottom: 110,   //距离容器下边界30像素
                left:'13%',
                right:'15%',
            },
            tooltip: {},
            legend: {
                selectedMode:false,
                data: [' ']
            },
            xAxis: {
                type: 'category',
                name: "日期",
                data: [""],
                axisLabel: {
                    interval: 0,
                    rotate: 45,
                    textStyle: {
                        fontSize: 11
                    }
                },
            },
            yAxis: {
                name: "数量",
                axisLabel: {
                    textStyle: {
                        fontSize: 11
                    }
                },
            },
            dataZoom: [{
                show: true,
                realtime: true,
                start: 20,
                end: 100,
                height: 20,
            }, {
                type: 'inside',
            }],
            series: [{
                name: ' ',
                type: 'bar',
                barWidth: '60%',
                data: [""]
            }]
        };
        lineOption = {
            title: {
                text: '同比趋势分析',
                subtext: ' ',
                textStyle: {
                    fontSize: 20,
                }
            },
            grid: {
                top: 100,//距离容器上边界40像素
                bottom: 110 ,  //距离容器下边界30像素
                left:'13%',
                right:'15%',
            },
            tooltip: {},
            legend: {
                selectedMode:false,
                data: [' ']
            },
            xAxis: {
                type: 'category',
                name: "日期",
                data: [],
                axisLabel: {
                    interval: 0,
                    rotate: 45,
                    textStyle: {
                        fontSize: 11
                    }
                },
            },
            yAxis: {
                name: "数量",
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
                height: 20,
            }, {
                type: 'inside',
            }],
            series: [{
                name: ' ',
                type: 'line',
                data: ['']
            }]
        };
        switch (screenWidth) {
            case 1366:
                barOption.grid.top = 75;
                barOption.grid.bottom = 100;
                barOption.title.textStyle.fontSize = 15;
                barOption.xAxis.axisLabel.textStyle.fontSize = 10;
                barOption.yAxis.axisLabel.textStyle.fontSize = 10;
                lineOption.grid.top = 75;
                lineOption.grid.bottom = 100;
                lineOption.title.textStyle.fontSize = 15;
                lineOption.xAxis.axisLabel.textStyle.fontSize = 10;
                lineOption.yAxis.axisLabel.textStyle.fontSize = 10;
                break;
            case 1600:
                barOption.grid.top = 80;
                barOption.grid.bottom = 100;
                barOption.title.textStyle.fontSize = 18;
                barOption.xAxis.axisLabel.textStyle.fontSize = 11;
                barOption.yAxis.axisLabel.textStyle.fontSize = 11;
                lineOption.grid.top = 80;
                lineOption.grid.bottom = 100;
                lineOption.title.textStyle.fontSize = 18;
                lineOption.xAxis.axisLabel.textStyle.fontSize = 11;
                lineOption.yAxis.axisLabel.textStyle.fontSize = 11;
                break;
            case 1680:
                barOption.grid.top = 80;
                barOption.grid.bottom = 100;
                barOption.xAxis.axisLabel.textStyle.fontSize = 11;
                barOption.yAxis.axisLabel.textStyle.fontSize = 11;
                lineOption.grid.top = 80;
                lineOption.grid.bottom = 100;
                lineOption.xAxis.axisLabel.textStyle.fontSize = 11;
                lineOption.yAxis.axisLabel.textStyle.fontSize = 11;
                break;
        }
        //使用制定的配置项和数据显示图表
        barChart.setOption(barOption);
        lineChart.setOption(lineOption);
    };

    /** *********1.点击查询按钮，触发刷新参数 *************************************************/
    $scope.toPoorAreaTrendAnalysis = () => {
        $scope.tableAnalysis = true;
        $scope.pageSelect = 2;
        //让按钮不可点击
        $("#toPoorAreaTrendAnalysis").attr('disabled', true);
        if ($scope.selDate === '') {
            $scope.tableAnalysis = false;
            $scope.pageSelect = 1;
            swal({
				showCloseButton:true,
                title:'<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
                text: '请选择时间!',
                allowOutsideClick: false,
                confirmButtonText:'确定',
                confirmButtonClass:'sure-class',
            });
            $("#toPoorAreaTrendAnalysis").attr('disabled', false);
            return;
        }
        if ($scope.timeSlot === '' || $scope.timeSlot === null) {
            $scope.tableAnalysis = false;
            $scope.pageSelect = 1;
            swal({
				showCloseButton:true,
                title:'<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
                text: '请选择时间段!',
                //type: 'warning',
                allowOutsideClick: false,
                confirmButtonText:'确定',
                confirmButtonClass:'sure-class',
            });
            $("#toPoorAreaTrendAnalysis").attr('disabled', false);
            return;
        }

        /***将时间日期转换成时间戳**/
        let startDate = ($scope.selDate).replace(/-/g, '/') + " " + $scope.timeSlot + ":00:00";
        let endDate = ($scope.selDate).replace(/-/g, '/') + " " + (+$scope.timeSlot + 1) + ":00:00";
        let date1 = new Date(startDate);
        let date2 = new Date(endDate);
        startTime = date1.getTime();
        endTime = date2.getTime();
        timeSlots = startTime + ',' + endTime;

        /**页面显示查询信息*/
        $scope.queryStatusMessage = `${$scope.selDate} ${$scope.timeSlot + ":00:00"}`;
        /**请求数据之后加载表格和图表*/
        $('.Savetheform').show();
        initPoorTrendGrid();
        initChart();

        let url = APIS.poorAreaTrend.getTableAnalysis;
        HttpRequestService.get(url, {
            timeSlots: timeSlots,
        }, response => {
            if(response == ''){
				$scope.trendGridOptions.data=[];
                swal({
					showCloseButton:true,
                    title:'<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
                    text: '没有获取到数据，请重新查询!',
                    allowOutsideClick: false,
                    confirmButtonText:'确定',
                    confirmButtonClass:'sure-class',
                });
                $("#toPoorAreaTrendAnalysis").attr("disabled", false);
                return;
            }
            $scope.trendGridOptions.data = response;
            $("#toPoorAreaTrendAnalysis").attr("disabled", false);
        }, () => {
            $("#toPoorAreaTrendAnalysis").attr("disabled", false);
			$scope.trendGridOptions.data=[];
            swal({
				showCloseButton:true,
                title:'<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
                text: '没有获取到数据，请重新查询!',
                allowOutsideClick: false,
                confirmButtonText:'确定',
                confirmButtonClass:'sure-class',
            });
            return;
        });
    };

    //style="float:right;color:#2BBCFF;cursor:pointer;"
    /********3.表格数据**********************************************/
    let cellTemplate = `
    <div class="ngCellText ui-grid-cell-contents" style="padding:0 30px;">
         <span style="float:left">{{COL_FIELD CUSTOM_FILTERS}}</span>
         <span class="blue"  ng-click="grid.appScope.getChart(col.displayName,row.entity.coverArea)">
             <i class="fa fa-line-chart indicator-chart-icon"></i>
         </span>
    </div>
    `;
    let cellTemplate1 = `
    <div class="ngCellText ui-grid-cell-contents" style="padding:0 30px;">
         <span>{{COL_FIELD CUSTOM_FILTERS}}</span>
    </div>
    `;

    let rowTemplate = `
     <div ng-mouseover="rowStyle={'background-color': '#D3F1FF'}; grid.appScope.onRowHover(this);" ng-mouseleave="rowStyle={}">
     <div  ng-style="rowStyle" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + '-' + col.uid + '-cell'"
     class="ui-grid-cell" ng-class="{ 'ui-grid-row-header-cell': col.isRowHeader }" role="{{col.isRowHeader ? 'rowheader' : 'gridcell'}}" ui-grid-cell>
     </div></div>
     `;


    /**初始化弱覆盖区域分析表*/
    const initPoorTrendGrid = () => {
        $scope.trendGridOptions = {
            rowTemplate: rowTemplate,
            rowHeight: 30,
            rowHeaderHeight: 30,
            columnDefs: [
                {name: 'coverArea', displayName: "区域", cellTemplate: cellTemplate1,width:105},
                {name: 'weakCoverageAreaCount', displayName: "弱覆盖区域数", cellTemplate: cellTemplate,width:145},
                {name: 'schoolCount', displayName: "学校", cellTemplate: cellTemplate,width:145},
                {name: 'industrialAreaCount', displayName: "工业区", cellTemplate: cellTemplate,width:145},
                {name: 'administrativeRegionCount', displayName: "行政区", cellTemplate: cellTemplate,width:145},
                {name: 'scienceParkCount', displayName: "科技园", cellTemplate: cellTemplate,width:145},
                {name: 'countrysideCount', displayName: "农村", cellTemplate: cellTemplate,width:145},
                {name: 'villageInCityCount', displayName: "城中村", cellTemplate: cellTemplate,width:145},
                {name: 'roadCount', displayName: "道路", cellTemplate: cellTemplate,width:145},
                {name: 'housingCount', displayName: "住宅区", cellTemplate: cellTemplate,width:145},
                {name: 'governmentAgencyCount', displayName: "政府机关", cellTemplate: cellTemplate,width:145},
                {name: 'factoryCount', displayName: "工厂", cellTemplate: cellTemplate,width:145},
                {name: 'businessZoneCount', displayName: "商业区", cellTemplate: cellTemplate,width:145},
                {name: 'parkingLotCount', displayName: "停车场", cellTemplate: cellTemplate,width:145},
                {name: 'officeCount', displayName: "办公", cellTemplate: cellTemplate,width:145},
                {name: 'commercialResidentialCount', displayName: "商住两用", cellTemplate: cellTemplate,width:145},
                {name: 'islandsCount', displayName: "岛屿", cellTemplate: cellTemplate,width:145},
                {name: 'highSpeedCount', displayName: "高速", cellTemplate: cellTemplate,width:145},
                {name: 'mainUrbanAreaCount', displayName: "主城区", cellTemplate: cellTemplate,width:145},
                {name: 'generalUrbanAreaCount', displayName: "一般城区", cellTemplate: cellTemplate,width:145},
                {name: 'urbanAreaCount', displayName: "城区", cellTemplate: cellTemplate,width:145},
                {name: 'countyTownCount', displayName: "县城", cellTemplate: cellTemplate,width:145},
                {name: 'townshipCount', displayName: "乡镇", cellTemplate: cellTemplate,width:145},
                {name: 'countyArterialRoadCount', displayName: "县级干道", cellTemplate: cellTemplate,width:145},
                {name: 'generalTownCount', displayName: "一般城镇", cellTemplate: cellTemplate,width:145},

            ],
            enableSorting: true,//是否支持排序(列)
            enableHorizontalScrollbar : 1,//表格的水平滚动条
            enableVerticalScrollbar : 1,//表格的垂直滚动条 (两个都是 1-显示,0-不显示)
            exporterCsvFilename: '弱覆盖区域趋势分析表.csv',
            exporterOlderExcelCompatibility: true,
            exporterAllDataFn: function () {
                return getTrendData()
                    .then(() => {
                            $scope.trendGridOptions.useExternalPagination = false;
                            $scope.trendGridOptions.useExternalSorting = false;
                            getTrendData = null;
                        }
                    );
            },
        };
        $scope.trendGridOptions.appScopeProvider = $scope;
        $scope.trendGridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };
        /***导出数据*/
        let getTrendData = function () {
            return new Promise((resolve, reject) => {
                let url = APIS.poorAreaTrend.getTableAnalysis;
                let param = {
                    timeSlots: timeSlots,
                };
                HttpRequestService.get(url, param, response => {
                    //$scope.trendGridOptions.totalItems = response.totalCount;
                    $scope.trendGridOptions.data = [];
                    angular.forEach(response, function (row) {
                        $scope.trendGridOptions.data.push(row);
                    });
                    resolve();
                }, () => {
                    reject();
                });
            });
        };
        /***触发导出全部数据*/
        $scope.exportTrendToCsv = () => {
            if ($scope.trendGridOptions.data.length === 0) {
                swal({
					showCloseButton:true,
                    title:'<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
                    text: '无数据不支持保存表格！',
                    allowOutsideClick: false,
                    confirmButtonText:'确定',
                    confirmButtonClass:'sure-class',
                });
                return;
            }
            $scope.gridApi.exporter.csvExport('all', 'all');
        };

        let innerWidth = window.innerWidth;
        /**适配不同的屏幕宽度*/
       /* if (innerWidth < 1367) {
            $scope.trendGridOptions.rowHeight = 22;
        } else if (innerWidth < 1681) {
            $scope.trendGridOptions.rowHeight = 25;
        } else if (innerWidth >= 1681){
            $scope.trendGridOptions.rowHeight = 30;
        }*/
		if (innerWidth < 1681) {
			$scope.trendGridOptions.rowHeight = 25;
		} else{
			$scope.trendGridOptions.rowHeight = 30;
		}
        $(window).resize(function () {
            let innerWidth1 = window.innerWidth;
            if (innerWidth1 < 1681) {
                $scope.trendGridOptions.rowHeight = 25;
            } else if (innerWidth1 >= 1681){
                $scope.trendGridOptions.rowHeight = 30;
            }
        });
        /**点击表格中的按钮加载图表数据*/
        $scope.getChart = (colmnName, areaName) => {
            let scene = '';
            //alert(scene + '-----' + areaName);
            if(colmnName==='弱覆盖区域数'){
                scene = colmnName;
            }else{
                scene = colmnName+'场景';
            }
            barOption.legend.data[0] = scene;
            barOption.title.subtext = areaName;
            barOption.series[0].name = scene;
            lineOption.legend.data[0] = scene;
            lineOption.title.subtext = areaName;
            lineOption.series[0].name = scene;
            getBarData(colmnName, areaName);
            getLineData(colmnName, areaName);
        };
    };

    /**环比分析*/
    const getBarData = (colmnName,coverArea)=>{
        let url = APIS.poorAreaTrend.getEchartsAnalysis;
        let param = {
            statisticalTime:startTime,
            areaType:colmnName,
            coverArea:coverArea,
            type:2,
            //pageIndex:0,
            //pageSize:-1
        };
        HttpRequestService.get(url,param,response => {
            //console.log(response);
            barOption.xAxis.data = response.time;
            barOption.series[0].data = response.indicatorValues;
            barChart.setOption(barOption);
        }, () => {
            swal({
				showCloseButton:true,
                title:'<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
                text: '没有获取到数据，请重新查询!',
                allowOutsideClick: false,
                confirmButtonText:'确定',
                confirmButtonClass:'sure-class',
            });
            return;
        });
    };
    /**同比分析*/
    const getLineData = (colmnName,coverArea)=>{
        let url = APIS.poorAreaTrend.getEchartsAnalysis;
        let param = {
            statisticalTime:startTime,
            areaType:colmnName,
            coverArea:coverArea,
            type:1,
        };
        HttpRequestService.get(url,param,response => {
            //console.log(response);
            lineOption.xAxis.data = response.time;
            lineOption.series[0].data = response.indicatorValues;
            lineChart.setOption(lineOption);
        }, () => {
            swal({
				showCloseButton:true,
                title:'<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
                text: '没有获取到数据，请重新查询!',
                allowOutsideClick: false,
                confirmButtonText:'确定',
                confirmButtonClass:'sure-class',
            });
            return;
        });
    };

    /** 初始化加载Controller */
    const initController = () => {
        //初始化时间
        initDatetimepicker();
    };
    initController();
}

PoorCoverageAreaTrendAnalysisController.$inject = ['$scope', '$filter', 'HttpRequestService'];
