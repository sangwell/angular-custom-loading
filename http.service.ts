import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {LocalStorageService} from './local-storage.service';
import {LoadingService} from './loading.service';

/* api interface url configuration */
@Injectable()
export class WebApiUrlConfigService {
    baseApiUrl = environment.baseApiUrl;

    // Account
    accountUrl = this.baseApiUrl + 'api/Account/';

}

type Params = HttpParams | {
    [param: string]: string | string[];
};

/* asynchronous request helper class */
@Injectable()
export class HttpRequestManagerService {

    constructor(private http: HttpClient,
                private loadingService: LoadingService) {
    }

    get<T = any>(url: string, params: any = null): Observable<T> {
        const getRequest = this.http.get<T>(url, {
            params: new HttpParams({
                fromObject: params
            }),
        });
        this.loadingService.start(getRequest);
        return getRequest;
    }

    getPlainText(url: string, params: Params = null) {
        return this.http.get(url, {
            params: params,
            responseType: 'text',
        });
    }

    getHtml(url: string) {
        return this.http.get(url);
    }

    post(url: string, parametersModel: any): Observable<any> {
        const postRequest = this.http.post(url, parametersModel, {});
        this.loadingService.start(postRequest);
        return postRequest;
    }

    download(url: string, parametersModel: any): Observable<any> {
        const downloadRequest = this.http.post(url, parametersModel, {
            responseType: 'blob'
        });
        this.loadingService.start(downloadRequest);
        return downloadRequest;
    }

    delete(url: string, parametersModel?: any): Observable<any> {
        const deleteRequest = this.http.delete(url, {
            params: parametersModel,
        });
        this.loadingService.start(deleteRequest);
        return deleteRequest;
    }

    put(url: string, parametersModel: any): Observable<any> {
        const putRequest = this.http.put(url, parametersModel, {});
        this.loadingService.start(putRequest);
        return putRequest;
    }
}
