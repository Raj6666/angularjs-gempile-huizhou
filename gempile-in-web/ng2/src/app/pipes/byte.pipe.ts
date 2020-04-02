// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({name: 'byte'})
// export class BytePipe implements PipeTransform {

//   transform(val: number):string {
//     if (val === 0) return '0B';
//     const k = 1024;
//     const unit = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//     const i = Math.floor(Math.log(val) / Math.log(k));
//     return (val / Math.pow(k, i)).toPrecision(3) + unit[i];
//   }

// }
