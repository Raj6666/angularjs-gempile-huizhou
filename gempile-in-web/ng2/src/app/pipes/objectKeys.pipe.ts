import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'objKeys'})
export class ObjectKeysPipe implements PipeTransform {

  transform(obj: object):Array<any> {
    return Object.keys(obj);
  }

}