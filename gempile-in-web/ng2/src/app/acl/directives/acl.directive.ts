import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ACLService } from '../services/acl.service';
import { ACLCanType } from '../services/acl.type';

@Directive({
  selector: '[acl]',
})
export class ACLDirective implements OnDestroy {
  private _value: any;
  private change$: Subscription;

  @Input('acl')
  set acl(value: ACLCanType) {
    this.set(value);
  }

  @Input('acl-ability')
  set ability(value: ACLCanType) {
    this.set(this.srv.parseAbility(value));
  }

  private set(value: ACLCanType) {
    const el = this.el.nativeElement;
    if (this.srv.can(value)) {
      this.renderer.setStyle(el, 'display', 'inline-block');
    } else {
      this.renderer.setStyle(el, 'display', 'none');
    }
    this._value = value;
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private srv: ACLService
  ) {
    this.change$ = <any>this.srv.change.subscribe(() => this.set(this._value));
  }

  ngOnDestroy(): void {
    this.change$.unsubscribe();
  }
}
