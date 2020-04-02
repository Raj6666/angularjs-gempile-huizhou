import { ITokenModel } from '../interface';
import { urlBase64Decode } from './jwt.helper';

export class JWTTokenModel implements ITokenModel {
  [key: string]: any;

  token: string;
  constructor(token?) {
    token && (this.token = token);
  }

  /**
   * 获取信息
   */
  get payload(): any {
    const parts = (this.token + '').split('.');
    if (parts.length !== 3) return false;

    const decoded = urlBase64Decode(parts[1]);
    return JSON.parse(decoded);
  }

  /**
   * 检查Token是否过期，`payload` 必须包含 `exp` 时有效
   *
   * @param offsetSeconds 偏移量
   */
  isExpired(offsetSeconds: number = 0): boolean {
    const decoded = this.payload;
    if (!decoded.hasOwnProperty('exp')) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);

    return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
  }
}
