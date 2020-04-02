'use strict';

/**
 * Created by TYRON on 2016/10/29.
 */
let idTmr;
const getExplorer = function getExplorer() {
	const explorer = window.navigator.userAgent;
	//ie
	if (explorer.indexOf("MSIE") >= 0) {
		return 'ie';
	}
	//firefox
	else if (explorer.indexOf("Firefox") >= 0) {
		return 'Firefox';
	}
	//Chrome
	else if (explorer.indexOf("Chrome") >= 0) {
		return 'Chrome';
	}
	//Opera
	else if (explorer.indexOf("Opera") >= 0) {
		return 'Opera';
	}
	//Safari
	else if (explorer.indexOf("Safari") >= 0) {
		return 'Safari';
	}
};
const method5 = function method5(tableid,name) {
	if (getExplorer() == 'ie') {
		var curTbl = document.getElementById(tableid);
		var oXL = new ActiveXObject("Excel.Application");
		var oWB = oXL.Workbooks.Add();
		var xlsheet = oWB.Worksheets(1);
		var sel = document.body.createTextRange();
		sel.moveToElementText(curTbl);
		sel.select();
		sel.execCommand("Copy");
		xlsheet.Paste();
		oXL.Visible = true;

		try {
			var fname = oXL.Application.GetSaveAsFilename("Excel.xls", "Excel Spreadsheets (*.xls), *.xls");
		} catch (e) {
			print("Nested catch caught " + e);
		} finally {
			oWB.SaveAs(name);
			oWB.Close(false);
			oXL.Quit();
			oXL = null;
			idTmr = window.setInterval("clean();", 1);
		}
	}
	else {
		tableToExcel(tableid,name)
	}
};
const clean = function clean() {
	window.clearInterval(idTmr);
	window.CollectGarbage();
};
const tableToExcel = (function tableToExcel() {
	const uri = 'data:application/vnd.ms-excel;base64,',
		// template = '<html><head><meta charset="UTF-8"></head><body><table>{table}</table></body></html>',
        template =
       `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
        <!--[if gte mso 9]>
        <xml>
        <x:ExcelWorkbook><x:ExcelWorksheets>
        <x:ExcelWorksheet>
        <x:Name>{worksheet}</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
        </xml><![endif]-->
        </head>
        <body>
        <table>{table}</table>
        </body>
        </html>`,
		base64 = function (s) {
			return window.btoa(unescape(encodeURIComponent(s)))
		},
		format = function (s, c) {
			return s.replace(/{(\w+)}/g,
				function (m, p) {
					return c[p];
				})
		};
	return function (table, name) {

		if (!table.nodeType) {
			table = document.getElementById(table);
		}
		const ctx = {
			worksheet: name || 'Worksheet' ,
			table: table.innerHTML,
		};
        let link = document.createElement('a');
        link.setAttribute('href',uri + base64(format(template, ctx)));
        link.setAttribute('download',name);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link = null;

	}
})();
module.exports = {
	tableToExcel,
	method5,
};

