import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AllService {
  constructor(private _http: HttpClient) {}

  getClients() {
    return this._http.get('http://invoice-api.ngminds.com/invoices/clients');
  }

  getItems() {
    return this._http.get('http://invoice-api.ngminds.com/invoices/items');
  }

  getTDSItems() {
    return this._http.get('http://invoice-api.ngminds.com/invoices/tds-types');
  }

  attachDocument(data: any) {
    return this._http.post(
      'http://invoice-api.ngminds.com/invoices/upload-file',
      data
    );
  }

  submitInvoice(data: any) {
    return this._http.post(
      'http://invoice-api.ngminds.com/invoices/submit',
      data
    );
  }
}
