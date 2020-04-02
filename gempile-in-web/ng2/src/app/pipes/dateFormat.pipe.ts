import {Pipe, PipeTransform} from '@angular/core';
import {noUndefined} from "@angular/compiler/src/util";

@Pipe({name: 'formatDate'})
export class DateFormatPipe implements PipeTransform {

  transform(timestamp: number) {
    if(timestamp !== null && timestamp !== undefined){
      let now = new Date(timestamp);
      let year = now.getFullYear();
      let month = now.getMonth() + 1;
      let date = now.getDate();
      return year+"-"+month+"-"+date;
    }
  }

}
