import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskMsisdn',
  standalone: true
})
export class MaskMsisdnPipe implements PipeTransform {
  transform(msisdn: string): string {
    if (!msisdn || msisdn.length <= 6) return msisdn;
    return msisdn.replace(/\d(?=\d{4})/g, 'X'); // Mask all but last 4 digits
  }
}