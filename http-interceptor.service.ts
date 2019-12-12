import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {
  Router
} from '@angular/router';
import {Injectable} from '@angular/core';
import {LocalStorageService} from './local-storage.service';
import {MessageService} from './message.service';
import {LOCAL_STORAGE_KEY} from '../interface';
import {NzMessageService} from 'ng-zorro-antd/message';
import {LoadingService} from './angular-loading.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  loadingCtrlId: string;
  pendingRequests = 0;

  constructor(
    private localStorageService: LocalStorageService,
    private router: Router,
    private loadingService: LoadingService,
    private messageService: MessageService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const url = request.url;
    const regex = /GetDeviceStates/g;
    const isIntervalLoading = regex.test(url);
    if (!isIntervalLoading) {
      // this.messageService.showLoading();
      this.loadingService.startApi();
    }
    const currentUser = this.localStorageService.getItem(LOCAL_STORAGE_KEY.CurrentUser);
    if (currentUser) {
      const token = JSON.parse(currentUser) ? JSON.parse(currentUser).token : '';
      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + token
          }
        });
      }
    }

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const contentDisposition = event.headers.get('Content-Disposition');
          if (contentDisposition) {
            const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
            this.localStorageService.setItem(LOCAL_STORAGE_KEY.DownFileName, decodeURI(filename));
          }
          const responseBody = event.body;
          if (responseBody && responseBody.hasOwnProperty('IsSuccess')) {
            if (!responseBody.IsSuccess) {
              setTimeout(() => {
                this.messageService.error(responseBody.Message);
              }, 0);
            }
          }
          // this.messageService.hideLoading();
          this.loadingService.endApi();
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        // console.log(error);
        switch (error.status) {
          case 400: {
            if (error.error.errors) {
              const errorList = [];
              const res = error.error.errors;
              // console.log(res);
              for (const p in res) {
                if (res[p] && res[p].length > 0) {
                  const list = res[p];
                  list.forEach(item => {
                    errorList.push(JSON.parse(item));
                  });

                }
              }
              setTimeout(() => {
                this.messageService.error(errorList[0].Content);
              }, 0);
            } else {
              setTimeout(() => {
                this.messageService.error(error.error.Content);
              }, 0);
            }
            break;
          }
          case 401: {
            setTimeout(() => {
              this.messageService.error('登陆超时，请重新登录');
            }, 0);
            window.localStorage.clear();
            this.router.navigate(['./passport/login']);
            break;
          }
          case 403: {
            this.messageService.error('您没有该操作的权限，请联系管理员');
            break;
          }
          case 500: {
            this.messageService.error('系统错误');
            break;
          }
          case 0: {
            this.messageService.error('服务器没有响应');
            break;
          }
        }
        // this.messageService.hideLoading();
        this.loadingService.endApi();
        return throwError(error);
      })
    );
  }
}
