'use strict';

/* eslint-disable no-undef*/
let config = CONFIG;
/* eslint-enable no-undef*/
const baseStates = [
    {
        stateRef: 'home',
        stateObj: {
            url: '/home',
            template: require('../../main.html'),
        },
    },
    {
        stateRef: 'login',
        stateObj: {
            url: '/login',
            template: require('../../views/Login.html'),
            controller: 'LoginController',
        },
    },
];
const staticStates = {
    homePageNew: {
        stateRef: 'homePageNew',
        stateObj: {
            parent: 'home',
            url: '/homePageNew',
            template: require('../../views/HomePageNew.html'),
            controller: 'HomePageNewController',
            controllerAs: 'HomePageCtrl',
        },
    },
    poorAreaGis:{
        name: '弱覆盖区域Gis分析',
        stateRef: 'poorAreaGis',
        stateObj: {
            parent: 'home',
            url: '/poorAreaGis',
            template: require('../../views/PoorCoverageAreaGisAnalysis.html'),
            controller: 'PoorCoverageAreaAnalysisController',
            controllerAs: 'poorCoverageAreaAnalysisController',
        },
    },
    poorAreaTrend:{
        name: '弱覆盖区域趋势分析',
        stateRef: 'poorAreaTrend',
        stateObj: {
            parent: 'home',
            url: '/poorAreaTrend',
            template: require('../../views/PoorCoverageAreaTrendAnalysis.html'),
            controller: 'PoorCoverageAreaTrendAnalysisController',
            controllerAs: 'poorCoverageAreaTrendAnalysisController',
        },
    },
    userDefinedArea:{
        name: '自定义区域分析',
        stateRef: 'userDefinedArea',
        stateObj: {
            parent: 'home',
            url: '/userDefinedArea',
            template: require('../../views/UserDefinedAreaAnalysis.html'),
            controller: 'UserDefinedAreaAnalysisController',
            controllerAs: 'userDefinedAreaAnalysisController',
        },
    },
    complaintLabel:{
        name: '投诉标签分析',
        stateRef: 'complaintLabel',
        stateObj: {
            parent: 'home',
            url: '/complaintLabel',
            template: require('../../views/ComplaintLabelAnalysis.html'),
            controller: 'ComplaintLabelAnalysisController',
            controllerAs: 'complaintLabelAnalysisController',
        },
    },
    complaintRanking:{
        name: '投诉排行分析',
        stateRef: 'complaintRanking',
        stateObj: {
            parent: 'home',
            url: '/complaintRanking',
            template: require('../../views/ComplaintRankingAnalysis.html'),
            controller: 'ComplaintRankingAnalysisController',
            controllerAs: 'ComplaintRankingAnalysisController',
        },
    },
	complaintDataEntry:{
		name: '投诉数据录入',
		stateRef: 'complaintDataEntry',
		stateObj: {
			parent: 'home',
			url: '/complaintDataEntry',
			template: require('../../views/ComplaintDataEntry.html'),
			controller: 'ComplaintDataEntryController',
			controllerAs: 'ComplaintDataEntryController',
		},
	},
	businessIndicatorTrend:{
		name: '业务指标趋势对比分析',
		stateRef: 'businessIndicatorTrend',
		stateObj: {
			parent: 'home',
			url: '/businessIndicatorTrend',
			template: require('../../views/BusinessIndicatorTrendAnalysis.html'),
			controller: 'BusinessIndicatorTrendAnalysisController',
			controllerAs: 'BusinessIndicatorTrendAnalysisController',
		},
	},
	indicatorsDailyBulletin:{
		name: '指标每日短信通报',
		stateRef: 'indicatorsDailyBulletin',
		stateObj: {
			parent: 'home',
			url: '/indicatorsDailyBulletin',
			template: require('../../views/IndicatorsDailyBulletin.html'),
			controller: 'IndicatorsDailyBulletinController',
			controllerAs: 'IndicatorsDailyBulletinController',
		},
	},
	automaticGenerationReports:{
    	name:'分析报告自动化生成',
		stateRef:'automaticGenerationReports',
		stateObj:{
    		parent:'home',
			url:'/automaticGenerationReports',
			template: require('../../views/AutomaticGenerationReports.html'),
			controller: 'AutomaticGenerationReportsController',
			controllerAs: 'AutomaticGenerationReportsController',
		}
	},
	emptyPage:{
		name:'空白页',
		stateRef:'emptyPage',
		stateObj:{
			parent:'home',
			url:'/emptyPage',
			template: require('../../views/EmptyPage.html'),
			controller: 'EmptyPageController',
			controllerAs: 'EmptyPageController',
		}
	},
	softMiningPoorAreaAnalysis:{
		name:'软采质差小区分析页',
		stateRef:'softMiningPoorAreaAnalysis',
		stateObj:{
			parent:'home',
			url:'/emptyPage2',
			template: require('../../views/EmptyPage.html'),
			controller: 'EmptyPageController',
			controllerAs: 'EmptyPageController',
		}
	},
};
const stateConfigs = {
    dev: ['homePageNew', 'poorAreaGis','poorAreaTrend','userDefinedArea','complaintLabel','complaintRanking','complaintDataEntry',
		'businessIndicatorTrend','indicatorsDailyBulletin','automaticGenerationReports','softMiningPoorAreaAnalysis','emptyPage'
    ],

    devBuild : ['homePageNew', 'poorAreaGis','poorAreaTrend','userDefinedArea','complaintLabel','complaintRanking','complaintDataEntry',
		'businessIndicatorTrend','indicatorsDailyBulletin','automaticGenerationReports','softMiningPoorAreaAnalysis','emptyPage'
    ],

	prodBuild : ['homePageNew', 'poorAreaGis','poorAreaTrend','userDefinedArea','complaintLabel','complaintRanking','complaintDataEntry',
		'businessIndicatorTrend','indicatorsDailyBulletin','automaticGenerationReports','softMiningPoorAreaAnalysis','emptyPage'
	],

};

let states = [];
let stateRefConfigs = [];
if (!config) {
    config = 'dev';
}
stateConfigs[config].map(item => {
    states.push(staticStates[item]);
});
states = baseStates.concat(states);
states.map(state => {
    stateRefConfigs.push(state.stateRef);
});
module.exports = {
    baseStates,
    states,
    staticStates,
    stateRefConfigs,
};