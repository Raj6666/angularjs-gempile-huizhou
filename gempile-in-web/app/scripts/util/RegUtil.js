'use strict';

/**
 * 整数正则匹配
 * 特殊符号正则匹配
 * 特殊字符正则匹配（不包含英文逗号）
 * */
const integerReg = /^-?\d+$/;
const isInteger = str => integerReg.test(str);

const specialReg = /^(?!_)(?!.*?_$)[-a-zA-Z0-9_\u4e00-\u9fa5]+$/;//非特殊符号的正则表达式
const isNotSpecial = str => specialReg.test(str);

const specialRegExceptComma = /^(?!_)(?!.*?_$)[\s-,a-zA-Z0-9\u4e00-\u9fa5]+$/;// 不包含英文逗号、空格和中划线的非特殊字符
const isSpecial = str => !specialRegExceptComma.test(str);

export default {
    isInteger,
    isNotSpecial,
    isSpecial,
};