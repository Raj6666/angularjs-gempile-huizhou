/**
 * Created by richstone on 2018/1/22.
 */
'use strict';

import APIS from '../configs/ApisConfig';
import echarts from 'echarts';
import swal from 'sweetalert2';
import Loading from '../custom-pulgin/Loading';
import StringUtils from '../util/StringUtils';
/**
 * Business Indicator Analysis Controller
 *
 * @ngInject
 * @constructor
 * @param $scope
 * @param $state
 * @param $filter
 * @param HttpRequestService
 * @param CheckDateUtils
 */
export default function BusinessIndicatorTrendAnalysisController($scope, $state, $filter, HttpRequestService, CheckDateUtils) {
	/**图表类型*/
	$scope.iconType = [{name: '折线图', value: '折线图'}, {name: '柱状图', value: '柱状图'}]
	/**点击选择图表类型*/
	$scope.selectIcon=thisIcon=>{
		$scope.selectedIcon=thisIcon;
	}
	/**切换图表类型图片*/
	$scope.isSelectIcon = thisIcon => $scope.selectedIcon == thisIcon ? 'images/icon_checked.png' : 'images/icon_unchecked.png';

	/**select插件内容翻译*/
	$scope.selectorText={
		checkAll:'选择全部',
		uncheckAll: '取消全部',
		buttonDefaultText: '请选择',
		dynamicButtonTextSuffix: '个选择',
		searchPlaceholder: '搜索',
	}
	/**一级维度分类*/
	$scope.oneLevelClassificationSetting={
		scrollableHeight: '140px',
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
	}

	/******************** 初始化加载页面 *******************************/
	/*const initController = () => {

	 });

	 };
	 initController();*/
}
BusinessIndicatorTrendAnalysisController.$inject = ['$scope', '$state', '$filter', 'HttpRequestService', 'CheckDateUtils'];
