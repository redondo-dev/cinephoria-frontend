import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private sidebarState = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this.sidebarState.asObservable();

  toggle() {
    this.sidebarState.next(!this.sidebarState.value);
  }

  close() {
    this.sidebarState.next(false);
  }

  open() {
    this.sidebarState.next(true);
  }
}
