import { NgModule, ModuleWithProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { MockConfig } from './mock.config';
import { MockService } from './src/mock.service';
import { MockInterceptor } from './src/mock.interceptor';

@NgModule({})
export class MockModule {
  static forRoot(config: MockConfig): ModuleWithProviders {
    return {
      ngModule: MockModule,
      providers: [
        MockService,
        { provide: MockConfig, useValue: config },
        { provide: HTTP_INTERCEPTORS, useClass: MockInterceptor, multi: true },
      ],
    };
  }
}
