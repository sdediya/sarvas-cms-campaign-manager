import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-no-access',
    templateUrl: './no-access.component.html',
    styleUrls: ['./no-access.component.css'],
    standalone: false
})
export class NoAccessComponent implements OnInit{
  messages: any;
  ngOnInit(): void {
    this.messages = [{ severity: 'error', summary: 'No Access', detail: "You don't have access to this page" }];
  }
}
