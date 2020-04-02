import { NgModule, ModuleWithProviders } from '@angular/core';

import { AuthConfig } from './auth.config';
import { STORE_TOKEN } from './store/interface';
import { SERVICE_TOKEN } from './token/interface';
import { LocalStorageStore } from './store/local-storage.service';
import { TokenService } from './token/token.service';

@NgModule({})
export class AuthModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AuthModule,
      providers: [
        AuthConfig,
        { provide: STORE_TOKEN, useClass: LocalStorageStore },
        { provide: SERVICE_TOKEN, useClass: TokenService },
      ],
    };
  }
}
