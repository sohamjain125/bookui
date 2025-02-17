import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  title = 'bookui';
  ngOnInit() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    
  }
}
