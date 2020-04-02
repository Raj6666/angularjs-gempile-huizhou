export const SoftDataConst = {
  questionTypeList :  [
    { label: '弱覆盖小区', value: 1},
    { label: '过覆盖小区', value: 2},
    { label: '重叠覆盖小区', value: 3},
    { label: '模三干扰小区', value: 5},
    { label: '低上行信噪比小区', value: 7}
  ],
  coverageDomainList: [
    { label: '全市', value: '全市'},
    { label: '惠城区', value: '惠城区'},
    { label: '惠阳区', value: '惠阳区'},
    { label: '惠东县', value: '惠东县'},
    { label: '博罗县', value: '博罗县'},
    { label: '大亚湾区', value: '大亚湾区'},
    { label: '龙门县', value: '龙门县'},
    { label: '仲恺区', value: '仲恺区'},
  ],
  judgeConditions: {
    1: '判断条件： 1.小区的MR采样点数>300；2.宏站小区的弱覆盖比例>20%；4、室分小区的弱覆盖比例>10%。',
    2: '判断条件： 1.小区的MR采样点数>300；2.TA大于2km且RSRP大于-103dbm的采样点占比大于10%的宏站小区。',
    3: '判断条件： 1.MR type=1,neighbor_1_freq、neighbor_2_freq、neighbor_3_freq非空；2.小区的MR采样点数>300；3.重叠覆盖度≥5%。',
    5: '判断条件： 1.MR type=1；2.小区的MR采样点数>300；3.服务小区PCI mod 3=同频邻小区PCI mod 3 & |服务小区RSRP-同频邻小区RSRP|<6的采样点比例≥5%。',
    7: '判断条件： 1.小区的MR采样点数>300；2.UL-SINR小于等于0的采样占比≥5%的小区。',
  },
  softMiningInfoTableHeader: {
    '弱覆盖小区': ['日期','地市','行政区','小区ID','小区中文名','平均RSRP','平均RSRQ','平均TA','天线挂高','天线下倾角','频段','总MR数','总MR数(>-110dbm)','弱覆盖MR数','弱覆盖MR比例',
      '(-110，-115]dbm区间用户数','(-115，-118]dbm区间用户数','(-118，-120]dbm区间用户数','(-120，-∞)dbm区间用户数'],
    '过覆盖小区': ['日期','地市','行政区','小区ID','小区中文名','平均RSRP','平均RSRQ','平均TA','天线挂高','天线下倾角','频段','总MR数','总MR数(>-110dbm)','过覆盖MR数','过覆盖MR比例',
      '小区总用户数','过覆盖影响用户数'],
    '重叠覆盖小区': ['日期','地市','行政区','小区ID','小区中文名','平均RSRP','平均RSRQ','平均TA','天线挂高','天线下倾角','频段','总MR数','总MR数(>-110dbm)','重叠覆盖MR数','重叠覆盖MR比例',
      '小区总用户数','重叠覆盖影响用户数'],
    '重叠覆盖小区对': ['地市','行政区','小区ID','小区中文名','邻小区平均RSRP(dBm)','邻小区平均RSRQ(dB)','邻小区平均TA','邻小区天线挂高(米)','邻小区下倾角(°)','总MR数','总MR数(>-110dbm)',
      '关联邻小区中文名','关联邻小区ID','邻小区符合条件采样点数','邻小区符合条件采样点比例(%)','主邻小区距离'],
    '模三干扰小区': ['日期','地市','行政区','小区ID','小区中文名','平均RSRP','平均RSRQ','平均TA','天线挂高','天线下倾角','频段','总MR数','总MR数(>-110dbm)',
      '小区总用户数','模3干扰影响用户数','PCI','平均UL-SINR(dB)','模3干扰影响小区数'],
    '模三干扰小区对': ['地市','行政区','小区ID','小区中文名','模三干扰邻小区平均RSRP(dBm)','模三干扰邻小区平均RSRQ(dB)','模三干扰邻小区平均TA','总MR数','总MR数(>-110dbm)',
      '模三干扰邻小区中文名','模三干扰邻小区ID','模三干扰采样点数','模3干扰比例','PCI','模三干扰邻小区PCI'],
    '低上行信噪比小区': ['日期','地市','行政区','小区ID','小区中文名','平均RSRP','平均RSRQ','平均TA','总MR数','总MR数(>-110dbm)',
      '小区总用户数','低上行信噪比影响用户数','低UL-SINR采样点数','低UL-SINR采样比例','平均UL-SINR(dB)','UL-SINR总采样点数']

  }

};
