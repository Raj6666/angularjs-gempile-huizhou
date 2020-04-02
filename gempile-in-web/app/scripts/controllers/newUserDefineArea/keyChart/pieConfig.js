export default {
	/*title: {
		right: 10,
		top: 'center',
		text: '页\n面\n显\n示\n时\n长',
		textStyle: {
			fontSize: 18,
			color: '#1e1e1e',
			fontStyle: 'normal',
			fontWeight: 'normal',
			fontFamily: 'sans-serif',
			lineHeight: 20,
		},
	},*/
	tooltip: { //提示框
		trigger: 'item',
		formatter: '{b} : -s',
		position: [15, 15],
	},
	legend: {
		show: false,
		orient: 'horizontal',
		data: [],
		selectedMode: false, //图例禁止点击
		// formatter: function(name){
		//     return name.length>4?name.substr(0,4)+"...":name;
		// },
		itemWidth: 0,
		itemHeight: 0,
		textStyle: {
			color: '#707070',
			fontStyle: 'normal',
			fontWeight: 'normal',
			fontFamily: 'sans-serif',
			fontSize: 11,
		},
	},
	series: [{
		name: '',
		type: 'pie',
		radius: ['80%', '70%'],
		/**饼图的大小*/
		center: ['45%', '50%'],
		/**饼图的中心*/
		hoverAnimation: false,
		/**经过饼图时是否变大*/
		label: {
			normal: {
				position: 'center',
			},
		},
		data: [{
				value: 0,
				name: '',
				label: {
					normal: {
						formatter: '',
						textStyle: {
							fontSize: 15,
							fontWeight: 'bolder',
							color: '#555',
						},
					},
				},
				itemStyle: {
					normal: {
						color: '#3399FF',
					},
				},
			},
			// {
			// 	value: 100,
			// 	name: '',
			// 	tooltip: {
			// 		show: false,
			// 	},
			// 	itemStyle: {
			// 		normal: {
			// 			color: '#FFB43C',
			// 		},
			// 		emphasis: {
			// 			color: '#FFB43C',
			// 		},
			// 	},
			// 	hoverAnimation: false,
			// }
		],
	}],
};