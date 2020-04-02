import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ACLGuard} from './acl';
import {Error403Component} from './components/403/403.component';
import {Error404Component} from './components/404/404.component';
import {Error500Component} from './components/500/500.component';
import {TokenGuard} from './services/token-guard.service';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'}, // 根路径默认跳转
  {path: 'softData', loadChildren: './components/SoftData/index.module#SoftDataModule'}, // 主页
  {path: '404', component: Error404Component},
  {path: '403', component: Error403Component},
  {path: '500', component: Error500Component}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
