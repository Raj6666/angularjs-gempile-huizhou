import pieConfig from './pieConfig';
import APIS from '../../../configs/ApisConfig';
import {AvgIcon, setAvgText} from '../avg.help';
import AllIndicators from '../../../data/UserDefinedAreaAnalysisDataConfig';
import { isPlainObject, formatNum } from '../../../util/tools';

const echarts = require('echarts');
const allIndicators = AllIndicators.indicatorsName13.concat(AllIndicators.indicatorsName14);

class KeyChart {

    constructor($scope) {
        this.$scope = $scope;
    }

	$onInit() {
		const self = this;
		//this.id = 'key1'; //随机分配ID
		this.cityIndicator = '';
        this.getIndicatorByVal();
		$(function () {
			self.chart = echarts.init(document.getElementById(self.id));
			self.setPie(null);
		})
	}

	$onChanges(e) {
		const val = this.data[parseInt(this.id.replace('key', ''))-1];
		if (val) {
			const isGood = val.gemUDAExamKpi > val.gemCityExamKpi;
			this.cityIndicator = val.gemCityExamKpi + this.item.unit;
			this.item.avg = AvgIcon[this.item.opt === 'h' ? (isGood ? 'h' : 'ml') : (isGood ? 'mh' : 'l')];
		}
		this.chart && this.setPie(val.gemUDAExamKpi);
	}

	setPie(data) {
		data = data || 0;
		let option = JSON.parse(JSON.stringify(pieConfig)); // 克隆基础配置
		option.tooltip.formatter = this.item.name + '：' + data + this.item.unit;
		option.series[0].data[0].value = this.item.unit === '%' ? data : (data ? 100 : 0);
		option.series[0].data[0].label.normal.formatter = data ? (formatNum(data) + this.item.unit) : '-' + this.item.unit;
		this.chart.setOption(option);
    }
    
    tapIndicator() {
		if (!this.$scope.$parent.$page.templateType) return false;
		this.$scope.$parent.indicators = this.item.name;
		let url = APIS.userDefinedArea.nineLteAndfourKeyIndicators;
		let param = {
			timeInterval: this.$scope.$parent.hourParticles,
			time: new Date(this.$scope.$parent.selectedTime.replace(/-/g, '/')).getTime(),
			area: this.$scope.$parent.selectOuterAreaName,
			selectId: parseInt(this.id.replace('key', ''))+8,
			cityOid: this.$scope.$parent.cityId
		};
		const templateId = this.$scope.$parent.$page.template[0].id;

		if (templateId !== 'default') {
			url = APIS.userDefinedArea.tonghuanbiAll;
			param.templateId = this.$scope.$parent.$page.template[0].id
		}
		this.$scope.$parent.setOption(url, param, this.item.name)
    }

    getIndicatorByVal() {
		const filterItem = allIndicators.filter(item => {
            return item.value === this.item.indicatorIndex;
		})[0];
        this.item = Object.assign({}, filterItem ? filterItem : {}, {
			avg: AvgIcon.h
		});
    }

	setAvgText() {
		return setAvgText(this.item);
	}
}

export default {
	template: require('./keyChart.html'),
	controller: KeyChart,
	bindings: {
		item: '<',
		id: '<',
		data: '<'
	}
};