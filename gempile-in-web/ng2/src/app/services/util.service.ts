import { Injectable } from '@angular/core';

declare var unescape: any;
@Injectable()
export class Util {
    getFileExt(name: string): string {
        return name.substring(name.lastIndexOf('.') + 1, name.length);
    }

    isPlainObject(value) {
        return !!value && Object.prototype.toString.call(value) === '[object Object]';
    }

    isArray(value) {
        return value instanceof Array;
    }

    isNumber(value) {
        return !!value && Object.prototype.toString.call(value) === '[object Number]';
    }

    isString(value) {
        return !!value && Object.prototype.toString.call(value) === '[object String]';
    }

    isFunction(value) {
        return !!value && Object.prototype.toString.call(value) === '[object Function]';
    }

    flatten(arr: Array<any>) {
        return arr.reduce((begin, current) => {
            Array.isArray(current) ?
                begin.push(...this.flatten(current)) :
                begin.push(current);
            return begin;
        }, []);
    }

    tableToExcel(el: Element, worksheetName, $window?) {
      const uri = 'data:application/vnd.ms-excel;base64,',
      template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
      base64 = function (s) {
          return ($window || window).btoa(unescape(encodeURIComponent(s)));
      },
      format = function (s, c) {
          return s.replace(/{(\w+)}/g, function (m, p) {
              return c[p];
          })
      };
      const ctx = {worksheet: worksheetName, table: el.innerHTML};
      return uri + base64(format(template, ctx));
    }

    downloadFile(url: string, fileName?: string) {
      var link = document.createElement('a');
      link.href = url;
      fileName && (link.download = fileName);
      link.target = '_blank';

      //兼容fixfox
      document.body.appendChild(link);

      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", false, false);
      link.dispatchEvent(evt);

      document.body.removeChild(link);
    }
}
