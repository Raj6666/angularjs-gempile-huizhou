import { Injector, Optional } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { HttpService } from '../../services/http.service';

import { ITokenModel } from './interface';
import { AuthConfig } from '../auth.config';

export abstract class BaseInterceptor implements HttpInterceptor {
  constructor(@Optional() protected injector: Injector) {}

  protected model: ITokenModel;

  abstract isAuth(options: AuthConfig): boolean;

  abstract setReq(
    req: HttpRequest<any>,
    options: AuthConfig
  ): HttpRequest<any>;

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
    const options = Object.assign(
      new AuthConfig(),
      this.injector.get(AuthConfig, null)
    );
    if (options.ignores) {
      for (const item of options.ignores as RegExp[]) {
        if (item.test(req.url)) {
          return next.handle(req);
        }
      }
    }

    if (options.allow_anonymous_key && req.params.has(options.allow_anonymous_key)) {
      return next.handle(req);
    }

    if (this.isAuth(options)) {
      req = this.setReq(req, options);
    } else {
      if (options.token_invalid_redirect === true) {
        setTimeout(() => {
          if (/^https?:\/\//g.test(options.login_url)) {
            location.href = options.login_url;
          } else {
            this.injector.get(Router).navigate([options.login_url]);
          }
        });
      }

      const hc = this.injector.get(HttpService, null);
      if (hc) {
        hc.end();
      }
      // return new Observable((observer: Observer<HttpEvent<any>>) => {
      //   const res = new HttpErrorResponse({
      //     status: 401,
      //     statusText: ``,
      //   });
      //   observer.error(res);
      // });
    }
    return next.handle(req);
  }
}
