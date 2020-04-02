export const AvgIcon = {
    h: 'redRising', // 自定义区域指标高于且优于全市平均指标
    mh: 'greenRising', // 自定义区域指标高于且劣于全市平均指标
    l: 'redDecline', // 自定义区域指标低于且优于全市平均指标
    ml: 'greenDecline' // 自定义区域指标低于且劣于全市平均指标
};

export function setAvgText(item) {
    if (!item.avg) return '';
    return item.avg.indexOf('l') > -1 ? '低' : '高';
}