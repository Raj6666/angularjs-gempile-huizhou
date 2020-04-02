/* eslint-disable */
let env = CONFIG;
/* eslint-enable */
let basePath = '';
switch (env) {
	case 'dev':
	case "devBuild":
		basePath = 'http://192.168.6.20:8585/gempile-rs-gis';
		//basePath = '.';
		break;
	case 'prodBuild':
		basePath = 'http://188.5.51.165:28401/gempile-rs-gis';
		break;
	case 'sitBuild':
		basePath = '/gempile-rs-gis';
		break;
	default:
		basePath = 'http://192.168.6.97:8080/gempile-rs-gis';
		break;
}
module.exports = {
	/**  登陆 */
	auth: {
		login: basePath + '/v1.4/authentication',
	},

	/** 城市 */
	city: basePath + '/v1.0/test-garnet',

	/** 首页 */
	index: {
		coreNetworkIndicatorAnalyse: basePath + '/v1.4/networkKeyIndicator/coreNetworkIndicatorAnalyse',
		wirelessNetworkIndicatorAnalyse: basePath + '/v1.4/networkKeyIndicator/wirelessNetworkIndicatorAnalyse',
		dimensionQuestionNumber: basePath + '/v1.4/autoAlert/DimensionQuestionNumber',
		businessDistribution: basePath + '/v1.4/networkOverview/businessDistribution',
		terminalDistribution: basePath + '/v1.4/networkOverview/terminalDistribution',

		/** 惠州项目指标数据 */
		networkElementRate: basePath + '/v1.4/hz/homePage/networkElementRate',
		businessDistributionPie: basePath + '/v1.4/hz/homePage/appDistribution',
		businessDistributionBar: basePath + '/v1.4/hz/homePage/appSubTypeFlowAndSubscribers',
		volteAndAssessmentIndicators: basePath + '/v1.4/hz/homePage/volteAndAssessmentIndicators',
		wholeNetworkDownloadFlowAndSubscribers: basePath + '/v1.4/hz/homePage/wholeNetworkDownloadFlowAndSubscribers',
		areaDownloadFlowAndSubscribers: basePath + '/v1.4/hz/homePage/areaDownloadFlowAndSubscribers',
		areaKeyIndicators: basePath + '/v1.4/hz/homePage/areaKeyIndicators',
	},

	/** 模板 */
	template: basePath + '/v1.4/templates/',

	/**弱覆盖区域gis分析*/
	poorAreaGis: {
		getPoorAreaGisAnalysis: basePath + '/v1.4/gisAnalysis/weakCoverageArea/hz/kpiList',
		getSectorData: basePath + '/v1.4/gisAnalysis/weakCoverageArea/hz/xdrListAndCellInfo',
	},

	/**弱覆盖区域趋势分析*/
	poorAreaTrend: {
		getTableAnalysis: basePath + '/v1.4/hz/trendAnalysis/indicators',
		getEchartsAnalysis: basePath + '/v1.4/hz/trendAnalysis/indicatorsAnalysisInfo',
	},

	/**自定义区域分析*/
	userDefinedArea: {
		/**所有小区的接口*/
		getSearchCellList: basePath + '/v1.4/hz/user/defined/area/analysis/addNewSettings/cellNameAlias',
		/**所有区域的接口*/
		getAllAreaList: basePath + '/v1.4/hz/user/defined/area/analysis/areaManage/getAllAreaList',
		/**通过区域得到小区的接口*/
		getCellListByArea: basePath + '/v1.4/hz/user/defined/area/analysis/areaManage/getCellListByArea',
		/**删除区域的接口*/
		deleteOneArea: basePath + '/v1.4/hz/user/defined/area/analysis/areaManage/delTableRowsByArea',
		/**设置的接口*/
		updateArea: basePath + '/v1.4/hz/user/defined/area/analysis/areaManage/updateArea',
		/**新增的接口*/
		addNewArea: basePath + '/v1.4/hz/user/defined/area/analysis/addNewSettings/addNewAreaRecord',
		/**关键指标接口*/
		examKpi: basePath + '/v1.4/hz/uda/examKpi',
		/**地图小区打点接口*/
		getLongitudeAndLatitude: basePath + '/v1.4/hz/user/defined/area/analysis/getLongitudeAndLatitude',
		/**人数统计接口*/
		subscribers: basePath + '/v1.4/hz/uda/userCount',
		/**流量统计接口*///已合并到关键指标接口中
		//areaFlow: basePath + '/hz/userDefineArea/flow',
		/**表格数据统计接口*/
		numberAttribution: basePath + '/v1.4/hz/uda/numberAttribution',
		/**右上角接口*/
		top10AppTypeFlow: basePath + '/v1.4/hz/uda/appTypeKpi',
		/**右下角接口*/
		top10FlowAppSubTypeInfo: basePath + '/v1.4/hz/uda/appSubTypeKpi',
		/*************以下是同环比接口*********************/
		/**1.区域人数的接口*/
		areaSubscriberCount: basePath + '/v1.4/hz/uda/tonghuanbi/userCount',
		/**2.区域总流量接口*/
		//coverAreaFlowSubscriber: basePath + '/hz/userDefineArea/tongbuanbi/coverAreaFlowSubscriber',
		/**3.归属地同环比接口*/
		attribution: basePath + '/v1.4/hz/uda/tonghuanbi/numberAttribution',
		/**4.9个LTE指标以及4个重要指标的时粒度的接口*/
		nineLteAndfourKeyIndicators: basePath + '/v1.4/hz/uda/tonghuanbi/examKpi',
		/**5.业务大类同环比接口*/
		appType: basePath + '/v1.4/hz/uda/tonghuanbi/appTypeKpi',
		/**6.业务小类同环比接口*/
		subType: basePath + '/v1.4/hz/uda/tonghuanbi/appSubTypeKpi',
		/**批量导入接口*/
		importNewArea: basePath + '/v1.4/hz/user/defined/area/analysis/addNewSettings/importNewArea',
		/**下载表格接口*/
		exportNumberAttribution: basePath + '/v1.4/hz/userDefineArea/exportNumberAttribution',
		// 获取模板
		templates: basePath + '/hz/user/defined/area/analysis/templates',
		// 删除模板
		delTemplate: basePath + '/hz/user/defined/area/analysis/delete/',
		// 保存模板
		saveTemplate: basePath + '/hz/user/defined/area/analysis/save',
		// 自定义模板业务指标
		defineAppKpi: basePath + '/v1.4/hz/uda/appKpi',
		// 自定义模板同环比
		tonghuanbiAll: basePath + '/v1.4/hz/uda/tonghuanbiAll/examKpi',
		// 自定义模板业务大类同环比
		appTypeTonghuanbi: basePath + '/v1.4/hz/uda/tonghuanbi/allAppTypeKpi',
	},

	/**投诉标签分析*/
	complaintLabel: {
		/**表格接口*/
		kpiList: basePath + '/v1.4/hz/complain/tag/kpiList',
		/**饼图接口*/
		ratios: basePath + '/v1.4/hz/complain/tag/ratios',
		/**折线图接口*/
		daysKpiList: basePath + '/v1.4/hz/complain/tag/daysKpiList',
		/**表格导出接口*/
		exportKpiList: basePath + '/v1.4/hz/complain/tag/exportKpiList',
	},

	/**投诉排行分析*/
	complaintRanking: {
		/**高投诉用户接口*/
		customerComplainRankKpiList: basePath + '/v1.4/hz/complain/tag/analysis/getCustomerComplainRankKpiList',
		/**高投诉基站接口*/
		baseStationList: basePath + '/v1.4/hz/complain/enodeb/rank/kpiList',
		/**高投诉用户导出表格接口*/
		customerExport: basePath + '/v1.4/hz/complain/tag/analysis/exportCustomerComplainRankKpiList',
		/**高投诉基站导出表格接口*/
		baseStationExport: basePath + '/v1.4/hz/complain/enodeb/rank/exportKpiList',
	},

	/**投诉数据录入*/
	complaintDataEntry: {
		/**客户投诉接口*/
		importCustomerComplaintFile: basePath + '/v1.4/hz/complain/tag/analysis/importCustomerComplaintFile',
		/**基站投诉接口*/
		importBaseStationComplaintFile: basePath + '/v1.4/hz/complain/tag/analysis/importBaseStationComplaintFile',
		/**客户投诉数据导入成功接口*/
		getDateOfCustomerComplainData: basePath + '/v1.4/hz/complain/tag/analysis/getDateOfCustomerComplainData',
		/**基站投诉数据导入成功接口*/
		getDateOfBaseStationComplainData: basePath + '/v1.4/hz/complain/tag/analysis/getDateOfBaseStationComplainData',
	},

	/**每日通报短信*/
	indicatorsDailyBulletin: {
		historySmsRecords: basePath + '/hz/dailySmsNotice/SmsHistoryRecords',
		groupsInfo: basePath + '/hz/dailySmsNotice/group/groupsInfo',
		createGroup: basePath + '/hz/dailySmsNotice/group/newGroup',
		updateGroupAndRule: basePath + '/hz/dailySmsNotice/group/groupAndRule',
		deleteGroup: basePath + '/hz/dailySmsNotice/group/',
		taskList: basePath + '/hz/dailySmsNotice/group/taskList',
		sendSms: basePath + '/hz/dailySmsNotice/group/sendSms',
		/**模板编辑模块接口*/
		getModuleOfSms: basePath + '/hz/dailySmsNotice/group/getModuleOfSms',
		updateModuleOfSms: basePath + '/hz/dailySmsNotice/group/updateModuleOfSms',
	},

	/** 自动化报告生成*/
	autoGenerateReport: {
		autoReport: basePath + "/v1.4/autoReport",
		downloadReport: basePath + "/v1.4/downloadReport",
		/**获取行政区的接口*/
		district: basePath + '/v1.4/district/',
	}
};