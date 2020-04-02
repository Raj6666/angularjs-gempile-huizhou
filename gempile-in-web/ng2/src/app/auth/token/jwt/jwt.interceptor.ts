import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest } from '@angular/common/http';

import { AuthConfig } from '../../auth.config';
import { BaseInterceptor } from '../base.interceptor';
import { SERVICE_TOKEN } from '../interface';
import { JWTTokenModel } from './jwt.model';

@Injectable()
export class JWTInterceptor extends BaseInterceptor {
  isAuth(options: AuthConfig): boolean {
    this.model = this.injector
      .get(SERVICE_TOKEN)
      .get<JWTTokenModel>(JWTTokenModel);
    return (
      this.model &&
      this.model.token &&
      !this.model.isExpired(options.token_exp_offset)
    );
  }

  setReq(req: HttpRequest<any>, options: AuthConfig): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        token: `${this.model.token}`,
      },
    });
  }
}
