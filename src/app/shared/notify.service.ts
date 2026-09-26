import { Injectable } from '@angular/core';
import { MessageService } from '@openng/optimus-ui/api';

@Injectable({ providedIn: 'root' })
export class NotifyService {
  constructor(private readonly messageService: MessageService) {}

  success(summary: string, detail?: string): void {
    this.messageService.add({ severity: 'success', summary, detail });
  }

  error(summary: string, detail?: string): void {
    this.messageService.add({ severity: 'error', summary, detail });
  }

  warn(summary: string, detail?: string): void {
    this.messageService.add({ severity: 'warn', summary, detail });
  }

  info(summary: string, detail?: string): void {
    this.messageService.add({ severity: 'info', summary, detail });
  }
}
