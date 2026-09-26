import { Pipe, PipeTransform } from '@angular/core';
import { I18nServiceService } from "../services/i18n-service.service"

@Pipe({
    name: 'i18n',
    pure: false,
    standalone: false
})
export class I18nPipe implements PipeTransform {

    constructor(public i18nService: I18nServiceService) { }

    transform(phrase: any, args: any = null): any {
        return this.i18nService.getTranslation(phrase, args);
    }

}