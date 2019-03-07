import { Injectable } from '@angular/core';
import { GoogleApiService } from 'ng-gapi';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { AuthService } from '../auth/auth.service';

const $ = require('jquery');

declare var require: any;


@Injectable()
export class GapiService {


    constructor(
        private http: HttpClient,
    ) { }


    getGoogleUserProfile(token): Promise<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get(`https://people.googleapis.com/v1/people/me
        ${'?personFields=names,emailAddresses,genders,photos,addresses'}`, { headers: headers })
            .map((response) => <any>response)
            .toPromise()
            .catch(error => {
                throw (error);
            });
    }

    getGoogleUserContact(token, callback = 'callback') {
        return this.http.jsonp(
            `https://www.google.com/m8/feeds/contacts/default/thin?alt=json&access_token=${token}&max-results=500&v=3.0`, callback)
            .map((response) => <any>response)
            .toPromise()
            .catch(error => {
                throw (error);
            });
    }
}
