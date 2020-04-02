import urls from '../../../configs/ApisConfig';

export class UserDefineAreaTemplateHttpService {
    constructor($http) {
        this.http = $http;
    }

    getTemplates() {
        return new Promise((resolve, reject) => {
            this.http.get(urls.userDefinedArea.templates, {}, (res) => {
                resolve(res);
            });
        });
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            this.http.delete(urls.userDefinedArea.delTemplate+id, {}, (res) => {
                resolve(res);
            });
        });
    }

    save(arr) {
        return new Promise((resolve, reject) => {
            this.http.post(urls.userDefinedArea.saveTemplate, null, arr, (res) => {
                resolve(res);
            });
        });  
    }

    // 获取业务指标数据
    getDateByTemplateId(json) {
        return new Promise((resolve, reject) => {
            this.http.get(urls.userDefinedArea.defineAppKpi, json, (res) => {
                resolve(res);
            });
        });  
    }
}

UserDefineAreaTemplateHttpService.$inject = ['HttpRequestService'];