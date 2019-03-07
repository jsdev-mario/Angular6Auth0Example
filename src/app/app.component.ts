import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { GoogleAuthService } from 'ng-gapi';
import { GoogleApiService } from 'ng-gapi';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    title = 'app';

    constructor(
        private auth_service: AuthService,
        public router: Router,
    ) {
        this.auth_service.handleAuthentication();
    }

    ngOnInit(): void {

    }

    public isLoggedIn(): boolean {
        return this.auth_service.isSignedIn();
    }

    public signIn() {
        this.auth_service.login();
    }

    public logOut() {
        this.auth_service.logout();
        this.router.navigate(['/']);
    }


}
