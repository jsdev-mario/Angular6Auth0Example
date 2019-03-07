import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { GapiService } from '../gapi/gapi.service';

declare var require: any;
const store = require('store');

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    profile: any;
    contacts: any;

    pizzas_array = [];

    constructor(
        public auth_service: AuthService,
        public gapi_service: GapiService,
        public router: Router
    ) {
        for (let i = 0; i < 20; i++) {
            this.pizzas_array.push(i);
        }
    }

    ngOnInit() {
        if (this.auth_service.isSignedIn()) {
            if (this.auth_service.getIDPToken()) {
                this.gapi_service.getGoogleUserProfile(this.auth_service.getIDPToken()).then(data => {
                    this.profile = data;
                    console.log(this.profile);
                }).catch(error => {
                    console.log(error);
                });
                this.gapi_service.getGoogleUserContact(this.auth_service.getIDPToken()).then(data => {
                    this.contacts = data;
                    console.log(this.contacts);
                }).catch(error => {
                    console.log(error);
                });
            } else {
                const self = this;
                this.auth_service.getProfile(function (error, data) {
                    self.profile = data;
                    console.log(self.profile);
                });
            }
        }
    }

    getTotalData() {
        return JSON.stringify(this.profile);
    }

    getJSON(object) {
        return JSON.stringify(object);
    }
}
