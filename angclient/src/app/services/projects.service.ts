import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions} from '@angular/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private mainapihosturl = environment.mainApiHostUrl;

  constructor(private http: Http) {}

   getProjectAggList(oBodyparam) {

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ headers: headers });

    return this.http.post(this.mainapihosturl + `/report`, JSON.stringify(oBodyparam), options)
        .pipe(map((response: Response) => response.json()),
        catchError(this.handleError));
  }

  updateProject(pid, oBodyparam) {

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ headers: headers });

    return this.http.put(this.mainapihosturl + `/project/${pid}`, JSON.stringify(oBodyparam), options)
      .pipe(map((response: Response) => response.json()),
      catchError(this.handleError));
  }

  updateProjecttime(pid, oBodyparam) {

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ headers: headers });

    return this.http.put(this.mainapihosturl + `/project/time/${pid}`, JSON.stringify(oBodyparam), options)
      .pipe(map((response: Response) => response.json()),
      catchError(this.handleError));
  }

  getProject(id) {

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const options = new RequestOptions({ headers: headers });

    return this.http.get(this.mainapihosturl + `/project/${id}`, options)
        .pipe(map((response: Response) => response.json()),
        catchError(this.handleError));
  }

  private handleError(error: Response) {
    const stdErrMsg = `Ooops sorry...a server error occured. Please try again shortly. <br>`;
    const errMsg = error.status ? `${stdErrMsg} ${'Error: &nbsp;' + error.status} - ${error.statusText}` : stdErrMsg;

    return throwError(errMsg);
  }
}
