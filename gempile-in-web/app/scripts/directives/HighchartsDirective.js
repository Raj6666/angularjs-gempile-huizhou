/**
 * Created by liangzheng on 2017/6/26.
 */
let Highcharts = require('highcharts');
require('../../../node_modules/highcharts/highcharts-more')(Highcharts);
require('../../lib/plugins/rounded-corners');
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
};
export default class HighchartsDirective{
    constructor(){
        this.restrict = 'E';
        this.scope = {
            options: "=",
            id: "@",
        };
        this.replace = true;
        this.template = '<div style="position: relative">\n    <div class="hchart"></div>\n    <div class="nodata"></div>\n</div>';
    }
    link($scope, iElement, iAttrs) {
        $scope.$watch('options.chartdata', function (newValue, oldValue) {
            if (newValue) {
                if ($scope.options.height) {
                    iElement.find('.hchart').height($scope.options.height);
                }
                var ops = angular.extend(chartOptions, $scope.options.chartdata, {
                    series: angular.copy($scope.options.chartdata.series)
                });
                iElement.find('.hchart').highcharts(ops,$scope.options.chartfn);
                $scope.options.obj = iElement.find('.hchart').highcharts();
            }
        });
        $scope.$watch('options.chartdata.series', function (newValue, oldValue) {
            if (newValue) {
                if ($scope.options.height) {
                    iElement.find('.hchart').height($scope.options.height);
                }
                var ops = angular.extend(chartOptions, $scope.options.chartdata, {
                    series: angular.copy($scope.options.chartdata.series)
                });
                iElement.find('.hchart').highcharts(ops,$scope.options.chartfn);
                $scope.options.obj = iElement.find('.hchart').highcharts();
            }
        }, true);
        $scope.$watch('options.height', function (newValue, oldValue) {
           /* if ($scope.options.height) {
                iElement.find('.hchart').height($scope.options.height);
            }
            $scope.options.obj.setSize(undefined, $scope.options.height);*/
        });
        window.addEventListener("resize", function () {
            if($scope.options.resize){
                $scope.options.resize();
            }
        });
    }
    controller($scope) {
        ;
    }
}
