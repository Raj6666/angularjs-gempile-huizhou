import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SoftDataComponent} from './index.component';

const routes: Routes = [
  {path: '', component: SoftDataComponent},
];

@NgModule({
  imports: [ RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SoftDataRoutingModule {}
