import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {
  constructor(private http: HttpClient) {}
  exportToExcel(exportUrl:any): Observable<Blob> {
    return this.http.get(exportUrl, {
      responseType: 'blob',
    });
  }
  
  exportToExcelPost(exportUrl:any, postBody:any): Observable<Blob> {
    return this.http.post(exportUrl, postBody, {
      responseType: 'blob',
    });
  }
}
