import { ApplicationRef, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { delay, map, catchError } from 'rxjs/operators';
import { Observable } from "rxjs";
/**
 * reference: https://github.com/tusharghoshbd/i18n_example/
 */
@Injectable({
  providedIn: 'root'
})
export class I18nServiceService {

  public data: any;
    public currentLanguage: any;
    public configs: any;

    constructor(
        private http: HttpClient,
        private ref: ApplicationRef) {
        this.setLanguage(localStorage.getItem('lang') || "english");
    }

    public setLanguage(language:any) {
        localStorage.setItem('lang', language);
        this.currentLanguage = language;
        this.fetch(language)
    }

    public getTranslation(phrase: string, variableData: any=null): string {
        if(this.data && this.data[phrase]){
            if(!variableData){
                return this.data[phrase];
            }
            let str = this.data[phrase];
            Object.keys(variableData).forEach((value)=>{
                let replacevaule = "{"+value+"}";
                str = str.replace( new RegExp(replacevaule, 'g'), variableData[value]);
            })
            return str;
        }
        else 
            return phrase;
    }

    private fetch(locale: any) {
        let langFilePath = `assets/i18n/${locale}.json`;
        this.fetchLangFile(langFilePath)
            .subscribe((data: any) => {
                this.data = data;
                this.ref.tick();
            })
    }

    private fetchLangFile(url:any): Observable<any> {
        let baseurl=location.protocol+'//'+location.hostname+(location.port? ':'+location.port:'')+'/';
        return this.http.get(baseurl+ url)
            .pipe(
                map((data: any) => (data.data || data))
            );
    }
}
