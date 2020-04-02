import { Injectable } from '@angular/core';
import { HttpRequest } from '@angular/common/http';

import { AuthConfig } from '../auth.config';
import { TokenModel } from './model';
import { BaseInterceptor } from '../token/base.interceptor';
import { SERVICE_TOKEN } from '../token/interface';

@Injectable()
export class Interceptor extends BaseInterceptor {
  isAuth(options: AuthConfig): boolean {
    this.model = this.injector.get(SERVICE_TOKEN).get() as TokenModel;
    return (
      this.model &&
      (typeof this.model.token === 'string' && this.model.token.length > 0)
    );
  }

  setReq(req: HttpRequest<any>, options: AuthConfig): HttpRequest<any> {
    const token = options.token_send_template.replace(
      /\$\{([\w]+)\}/g,
      (_: string, g) => this.model[g]
    );
    switch (options.token_send_place) {
      case 'header':
        const obj = {};
        obj[options.token_send_key] = token;
        req = req.clone({
          setHeaders: obj,
        });
        break;
      case 'body':
        const body = req.body || {};
        body[options.token_send_key] = token;
        req = req.clone({
          body: body,
        });
        break;
      case 'url':
        req = req.clone({
          params: req.params.append(options.token_send_key, token),
        });
        break;
    }
    return req;
  }
}
