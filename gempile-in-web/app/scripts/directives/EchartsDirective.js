/*
 * 广州丰石科技有限公司拥有本软件版权2016并保留所有权利。
 * Copyright 2016, Guangzhou Rich Stone Data Technologies Company Limited,
 * All rights reserved.
 */

/**
 * author liangzheng
 * directive 'jqgrid'
 * @export
 * @class JQGrid
 */
import echarts from 'echarts';
let chartOptions = {
    chart: {
        type: 'line'
    },
    title: {
        text: 'chart title'
    },
    xAxis: {
        categories: []
    },
    series: []
}
export default class EchartsDirective{
    constructor() {
        this.restrict = 'E';
        this.scope = {
            options: '=',
            id: '@',
        };
        this.replace = true;
        this.template = '<div style="position: relative">\n    <div class="echart"></div>\n    <div class="nodata"></div>\n</div>';
    }

    link($scope, iElement, iAttrs){
        $scope.$watch('options.chartdata', function (newValue, oldValue) {
            if (newValue) {
                if ($scope.options.height) {
                    iElement.find('.echart').height($scope.options.height);
                }
                var ops = angular.extend(chartOptions, $scope.options.chartdata, {
                    series: angular.copy($scope.options.chartdata.series),
                });
                //$scope.options.obj = iElement.find('.echart').echarts();
                var theme= {};
                $scope.options.obj = echarts.init(iElement.find('.echart')[0]);
                var option = $scope.options.chartdata;
                $scope.options.obj.setOption(option);
                window.addEventListener("resize", function () {

                    $scope.options.obj.resize();

                });
                //window.onresize = $scope.options.obj.resize;
            }
        });
        $scope.$watch('options.chartdata.series', function (newValue, oldValue) {
            if (newValue) {
                if ($scope.options.height) {
                    iElement.find('.echart').height($scope.options.height);
                }
                var ops = angular.extend(chartOptions, $scope.options.chartdata, {
                    series: angular.copy($scope.options.chartdata.series)
                });
                //$scope.options.obj = iElement.find('.echart').echarts();
                var theme= {};
                $scope.options.obj = echarts.init(iElement.find('.echart')[0]);
                var option = $scope.options.chartdata;
                $scope.options.obj.setOption(option);
                window.addEventListener("resize", function () {

                    $scope.options.obj.resize();

                });
                //window.onresize = $scope.options.obj.resize;
            }
        }, true);
        $scope.$watch('options.chartdata.series', function (newValue, oldValue) {
            if (newValue && newValue.length != 0) {
                iElement.find('.nodata').hide();
            }
            else {
                iElement.find('.nodata').show();
            }
        }, true)
    }
    controller($scope) {
        ;
    }
}



