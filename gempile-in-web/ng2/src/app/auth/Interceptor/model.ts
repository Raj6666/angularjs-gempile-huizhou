import { ITokenModel } from '../token/interface';

export class TokenModel implements ITokenModel {
  [key: string]: any;

  token: string;
}
