/**
 * Created by chenzeou on 2017/5/25 0025.
 */
export default function CheckInputFactory() {

    return {
        legalChar (val) {
            const pat=/^[0-9a-zA-Z\u4E00-\u9FA5]*$/;
            return pat.test(val);
        },
        legalPhone (val) {
            const pat=/^1[345789]\d{9}$/;
            return pat.test(val);
        },
		/**匹配多个号码，并用逗号隔开*/
		legalManyPhone (val) {
			const pat=/^1[345789]\d{9}(?:\,1[345789]\d{9})*$/;
			return pat.test(val);
		},
    }
}