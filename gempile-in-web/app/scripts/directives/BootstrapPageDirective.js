/*
 * 广州丰石科技有限公司拥有本软件版权2016并保留所有权利。
 * Copyright 2016, Guangzhou Rich Stone Data Technologies Company Limited,
 * All rights reserved.
 */

/**
 * directive 'boot-page'
 *
 * @export
 * @class PaginationDirective
 */
export default class BootstrapPageDirective {
	constructor($compile) {
    this.$compile = $compile;
	this.restrict = 'EA';
	this.scope=true;
	this.template='{{bootPage}}';
	}
    link($scope, element, attrs) {

        let scopeParentObj=$scope.$parent;
        let $this=this;
            $scope.pageDimensionType=attrs.id;
            $scope.ngClassValue= "{true:'btn btn-outline-info-select',false:'btn btn-outline-info'}[pageConfig[pageDimensionType].selectPage===i]";
            let html= $(
                '<div style="text-align:center">' +
                '<button class="btn btn-outline-info" ng-click="pageTurning(-1,pageDimensionType)" ng-disabled="pageConfig.{{pageDimensionType}}.selectPage===1"><< </button>' +
                '<button class="btn btn-link" ng-show="pageConfig[pageDimensionType].displayPage[0]>1" ng-click="morePage(-pageConfig[pageDimensionType].morePage,pageDimensionType)">.... </button> ' +
                '<span  class="btn btn-link" ng-show="pageConfig[pageDimensionType].isLoading" >正在获取数据.... </span> ' +
                '<button ng-click="getThisPage($event.target,pageDimensionType)" ng-repeat="i in pageConfig[pageDimensionType].displayPage" ng-show="!pageConfig[pageDimensionType].isLoading" ng-class="{{ngClassValue}}">{{i}}</button>'+
                '<button class="btn btn-link" ng-show="pageConfig[pageDimensionType].displayPage[pageConfig[pageDimensionType].displayPage.length-1]!==pageConfig[pageDimensionType].pageCount" ' +
                'ng-click="morePage(pageConfig[pageDimensionType].morePage,pageDimensionType)">....</button>'+
                '<button class="btn btn-outline-info" ng-disabled="pageConfig[pageDimensionType].selectPage===pageConfig[pageDimensionType].pageCount" ng-click="pageTurning(1,pageDimensionType)">>></button>'+
                '</div>');
            $this.$compile(html)($scope).appendTo(element);

        const displayPageNum=function(num) { //将翻页按钮数值转为array显示
            let conArray = [];
            for (let i = 0; i < num; i++) {
                conArray.push(i + 1)
            }
            return conArray;
        };
        const displayMaxPageNum=function(num, max) {//当点击...（更多）到溢出最后一页时，直接将数组设置为最后一页-显示的个数
            let conArray = [];
            for (let i = num-1; i >=0; i--) {
                conArray.push(max - i)
            }
            return conArray;
        };
        $scope.pageConfig[attrs.id].displayPage=displayPageNum($scope.pageConfig[attrs.id].displayPage);//初始化：数值->数组
        scopeParentObj.setDisplayPage=function (dimensionType) {//接口返回数据之后比较总页数和config设定的要展示按钮值对比
          let disPage;

          if($scope.pageConfig[dimensionType].selectPage===1){
              disPage=displayPageNum($scope.pageConfig[dimensionType].initDisplayPage);
          }else {
              disPage=$scope.pageConfig[dimensionType].displayPage;
          }
          let page= $scope.pageConfig[dimensionType].pageCount > $scope.pageConfig[dimensionType].initDisplayPage ?//接口返回总页数>设置显示的页数?按照设置的现在:只显示接口总页数大小
                disPage :
                displayPageNum($scope.pageConfig[dimensionType].pageCount);

            $scope.pageConfig[dimensionType].isLoading=false;//调用此方法说明接口已返回数据，将提示字段隐藏
            return page;
        };
        $scope.getThisPage = function ($event,tag) {//点击某一页调用的方法

            $scope.pageConfig[tag].selectPage= parseInt($event.innerHTML);
            $scope.pageConfig[tag].onChangePage($scope.pageConfig[tag].selectPage)
        };
        $scope.pageTurning = function (i,tag) {//翻页方法
            let displayPage=$scope.pageConfig[tag].displayPage;//翻页按钮个数数组
            let selectPage=$scope.pageConfig[tag].selectPage;//当前选中的页数

            if (displayPage.indexOf(selectPage)===-1){
                selectPage=(i>0?displayPage[0]-1:displayPage[displayPage.length-1]+1);
            }
            selectPage =selectPage + i;
            if (selectPage >displayPage[displayPage.length - 1] || selectPage <displayPage[0]) {
                $scope.morePage(i,tag)
            }
            $scope.pageConfig[tag].displayPage=displayPage;
            $scope.pageConfig[tag].selectPage=selectPage;
            $scope.pageConfig[tag].onChangePage(selectPage)
        };
        $scope.morePage = function (num,tag) {
            let displayPage=$scope.pageConfig[tag].displayPage;
            let pageCount=$scope.pageConfig[tag].pageCount;
            let initDisplayPage=$scope.pageConfig[tag].initDisplayPage;
            for (let i = 0; i < displayPage.length; i++) {
                if (num > 0) {
                    if (displayPage[i] + num > pageCount) {
                        displayPage = displayMaxPageNum(initDisplayPage,pageCount);
                        $scope.pageConfig[tag].displayPage=displayPage;
                        return;
                    } else {
                        displayPage[i] =displayPage[i] + num;
                    }
                } else {
                    if (displayPage[i] + num < 1) {
                        displayPage = displayPageNum(initDisplayPage);
                        $scope.pageConfig[tag].displayPage=displayPage;
                        return;
                    } else {
                        displayPage[i] = displayPage[i] + num;
                    }
                }
                $scope.pageConfig[tag].displayPage=displayPage;
            }
        };
        // init();
    }
}



