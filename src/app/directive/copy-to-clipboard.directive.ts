import { Directive, Input, HostListener } from '@angular/core';

@Directive({
    selector: '[appCopyToClipboard]',
    standalone: false
})
export class CopyToClipboardDirective {

  @Input() appCopyToClipboard: string = '';

  @HostListener('click')
  
  onClick() {
    this.copyTextToClipboard();
  }

  private copyTextToClipboard() {
    const textarea = document.createElement('textarea');
    textarea.value = this.appCopyToClipboard;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }


}
