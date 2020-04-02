import { Injectable } from '@angular/core';
import urls from '../../urls';
import { HttpService } from '../../services/http.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SoftDataeIndexApi {
    constructor(
        private http: HttpService
    ) {}


}