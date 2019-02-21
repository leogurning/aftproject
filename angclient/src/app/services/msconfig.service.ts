import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions} from '@angular/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MsconfigService {
  private mainapihosturl = environment.mainApiHostUrl;

  constructor(private http: Http) { }

  getDeptList() {

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ headers: headers });

    return this.http.get(`${this.mainapihosturl}/dept/list`, options)
        .pipe(map((response: Response) => response.json()),
        catchError(this.handleError));
  }

  getCampList() {

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ headers: headers });

    return this.http.get(`${this.mainapihosturl}/camp/list`, options)
        .pipe(map((response: Response) => response.json()),
        catchError(this.handleError));
  }

  getDateList(oBodyparam) {

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ headers: headers });

    return this.http.post(`${this.mainapihosturl}/date/list`, JSON.stringify(oBodyparam), options)
        .pipe(map((response: Response) => response.json()),
        catchError(this.handleError));
  }

  getDateTable(oBodyparam) {

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ headers: headers });

    return this.http.post(`${this.mainapihosturl}/date/table`, JSON.stringify(oBodyparam), options)
        .pipe(map((response: Response) => response.json()),
        catchError(this.handleError));
  }

  private handleError(error: Response) {
    const stdErrMsg = `Ooops sorry...a server error occured. Please try again shortly. <br>`;
    const errMsg = error.status ? `${stdErrMsg} ${'Error: &nbsp;' + error.status} - ${error.statusText}` : stdErrMsg;

    return throwError(errMsg);
  }
}
