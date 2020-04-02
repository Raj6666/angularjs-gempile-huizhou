import { InjectionToken } from '@angular/core';
import { ITokenModel } from '../token/interface';

export const STORE_TOKEN = new InjectionToken<IStore>('AUTH_STORE_TOKEN');

export interface IStore {
  get(key: string): ITokenModel;

  set(key: string, value: ITokenModel): boolean;

  remove(key: string);
}
