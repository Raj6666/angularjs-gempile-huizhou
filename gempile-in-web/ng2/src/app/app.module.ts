import { environment } from '../environments/environment';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgZorroAntdModule, NZ_I18N, zh_CN} from 'ng-zorro-antd';
import {CommonModule, HashLocationStrategy, LocationStrategy} from '@angular/common';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {Error403Component} from './components/403/403.component';
import {Error404Component} from './components/404/404.component';
import {Error500Component} from './components/500/500.component';

import {AuthModule, JWTInterceptor} from './auth';
import {ACLModule} from './acl';
import {HttpService} from './services/http.service';
import {SimpleHttpInterceptor} from './services/interceptor.service';
import {TokenGuard} from './services/token-guard.service';
import {Util} from './services/util.service';

import {MockModule} from './mock';
import * as MOCKDATA from '../_mock';

import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
registerLocaleData(zh);

//const MOCKMODULE = !environment.production ? [ MockModule.forRoot({ data: MOCKDATA, log: true }) ] : [];
const MOCKMODULE = [ MockModule.forRoot({ data: MOCKDATA, log: true }) ];

@NgModule({
  declarations: [
    AppComponent,
    Error403Component,
    Error404Component,
    Error500Component
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgZorroAntdModule.forRoot(),
    ACLModule.forRoot(),
    // AuthModule.forRoot(),
    ...MOCKMODULE
  ],
  providers: [
    HttpService,
    TokenGuard,
    Util,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    { provide: NZ_I18N, useValue: zh_CN },
    // { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true},
    { provide: HTTP_INTERCEPTORS, useClass: SimpleHttpInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


