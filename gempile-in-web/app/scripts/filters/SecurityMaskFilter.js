'use strict';

/**
 * The filter to add security mask.
 * @export
 */
export default function SecurityMaskFilter() {
    return function (networkElement, dimension) {
        let str = networkElement + '';
        if (!networkElement || !dimension) {
            return networkElement;
        } else if (dimension === 'IMSI' || dimension === 'imsi') {
            if (str.length >= 5) {
                return str.substr(0, str.length - 5) + '****' + str.substr(str.length - 1);
            }
            return null;
        } else if (dimension === 'IMEI' || dimension === 'imei') {
            if (str.length > 12) {
                return str.substr(0, 8) + '****' + str.substr(12);
            } else if (str.length == 12) {
                return str.substr(0, 8) + '****';
            }
            return null;
        } else if (dimension === 'MSISDN' || dimension === 'msisdn') {
            if (str.length >= 8 && str.substr(0, 2) == '86') {
                return str.substr(0, 3) + '****' + str.substr(7);
            } else if (str.length >= 6) {
                return str.substr(0, 1) + '****' + str.substr(5);
            }
            return null;
        }
        return networkElement;
    }
}