import { NgModule } from '@angular/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SoftDataRoutingModule } from './index-routing.module';

import { SoftDataComponent } from './index.component';

import { ObjectKeysPipe } from '../../pipes/objectKeys.pipe';

import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import {DateFormatPipe} from "../../pipes/dateFormat.pipe";
registerLocaleData(zh);

@NgModule({
    declarations: [
        SoftDataComponent,
        ObjectKeysPipe,
        DateFormatPipe
    ],
    imports: [
        NgZorroAntdModule.forRoot(),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SoftDataRoutingModule
    ]
})
export class SoftDataModule {}
