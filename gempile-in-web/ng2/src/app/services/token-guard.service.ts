import {
    CanLoad,
    Route,
    Router
} from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { JWTTokenModel, SERVICE_TOKEN, ITokenService } from '../auth';


@Injectable()
export class TokenGuard implements CanLoad {
    constructor(
        private router: Router,
        @Inject(SERVICE_TOKEN) private tokenServer: ITokenService
    ) { }

    canLoad(route: Route): boolean {
        const JWT = this.tokenServer.get(JWTTokenModel);
        if (!Object.keys(JWT.token).length) {
            this.router.navigateByUrl(this.tokenServer.login_url);
            return false;
        }

        return true;
    }

}

