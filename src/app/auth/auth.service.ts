import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import * as auth0 from 'auth0-js';
import Config from '../config';
import { JwtHelperService } from '@auth0/angular-jwt';
const $ = require('jquery');
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
declare var require: any;
const store = require('store');

(window as any).global = window;

@Injectable()
export class AuthService {


    auth0 = new auth0.WebAuth({
        clientID: Config.CLIENT_ID,
        domain: Config.DOMAIN,
        responseType: 'token id_token',
        audience: `https://${Config.DOMAIN}/userinfo`,
        redirectUri: Config.CALLBACK_URL,
        scope: 'openid profile'
    });

    constructor(
        public router: Router,
        public http: HttpClient,
    ) { }

    public login(): void {
        this.auth0.authorize();
    }

    public handleAuthentication(): void {
        this.auth0.parseHash(async (err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = '';
                try {
                    this.setSession(authResult);
                    console.log(authResult);
                    const managetoken_data = await this.createAPIManagementTokenFromAuth0();
                    this.setAPIManagementToken(managetoken_data);
                    if (authResult.idTokenPayload.sub.indexOf('google') > -1) {
                        const gfull_provile: any = await this.getUserFullProfile(authResult.idTokenPayload.sub);
                        const exist_user: any = await this.getUser(gfull_provile.email);
                        if (exist_user.length > 1) {
                            const primary_user = this.getPrimaryUser(exist_user);
                            const second_user = this.getSecondUser(exist_user);
                            const response = await this.mergeUser(primary_user.user_id,
                                second_user.identities[0].provider, second_user.identities[0].user_id);
                        }
                        this.setIDPToken(gfull_provile);
                    } else {
                        const exist_user: any = await this.getUser(authResult.idTokenPayload.name);
                        if (exist_user.length > 1) {
                            let primary_user = this.getPrimaryUser(exist_user);
                            const second_user = this.getSecondUser(exist_user);
                            const response = await this.mergeUser(primary_user.user_id,
                                second_user.identities[0].provider, second_user.identities[0].user_id);
                            primary_user = await this.getUser(authResult.idTokenPayload.name);
                            this.setIDPToken(primary_user);
                        } else {
                            this.removeIDPToken();
                        }
                    }
                    this.router.navigate(['/']);
                } catch (error) {
                    console.log(error);
                    this.router.navigate(['/']);
                }
            } else if (err) {
                this.router.navigate(['/']);
                console.log(err);
            }
        });
    }

    private async getUser(email) {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getAPIManagementToken()}`,
        });
        return this.http.get(`https://${Config.DOMAIN}/api/v2/users?q=email:${email}&search_engine=v3`, { headers: headers }).toPromise();
    }

    private async deleteUser(user_id) {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getAPIManagementToken()}`,
        });
        return this.http.delete(`https://${Config.DOMAIN}/api/v2/users/${user_id}`, { headers: headers }).toPromise();
    }

    private async mergeUser(primaryuser_id, seconduser_provider, seconduser_id) {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getAPIManagementToken()}`,
            'content-type': 'application/json'
        });
        const response = await this.http.post(`https://pizza4242.auth0.com/api/v2/users/${primaryuser_id}/identities`,
            {
                provider: seconduser_provider,
                user_id: seconduser_id,
            },
            { headers: headers }).toPromise();
        return response;
    }

    private getPrimaryUser(users) {
        let primary_user: any;
        users.forEach(user => {
            if (user.identities[0].isSocial) {
                primary_user = user;
            }
        });
        return primary_user;
    }

    private getSecondUser(users) {
        let second_user: any;
        users.forEach(user => {
            if (!user.identities[0].isSocial) {
                second_user = user;
            }
        });
        return second_user;
    }

    private async createAPIManagementTokenFromAuth0() {
        const headers: HttpHeaders = new HttpHeaders({
            'content-type': 'application/json',
        });

        const param = {
            client_id: Config.AUTH0MANAGEAPI_CLIENT_ID,
            client_secret: Config.AUTH0MANAGEApI_CLIENT_SECRET,
            audience: `https://${Config.DOMAIN}/api/v2/`,
            grant_type: 'client_credentials'
        };

        const response: any = await this.http.post(`https://${Config.DOMAIN}/oauth/token`, param, { headers: headers }).toPromise();
        return response;
    }

    async getUserFullProfile(user_id) {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getAPIManagementToken()}`,
        });
        const response = await this.http.get(`https://${Config.DOMAIN}/api/v2/users/${user_id}`, { headers: headers }).toPromise();
        return response;
    }

    private setSession(authResult): void {
        // Set the time that the Access Token will expire at
        const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
        // general user identification token.
        store.set('tokens', {
            'access_token': authResult.accessToken,
            'id_token': authResult.idToken,
            'expires_at': expiresAt
        });
        store.set('user_id', authResult.idTokenPayload.sub);
    }

    private setAPIManagementToken(data) {
        const expiresAt = JSON.stringify((data.expires_in * 1000) + new Date().getTime());
        // token to call Auth0 apis.
        store.set('apimanage_token', {
            access_token: data.access_token,
            expires_at: expiresAt,
        });
    }

    private setIDPToken(data) {
        // token to third part API when user logged in with social
        // if google, this same google Auth2 token
        store.set('idp_token', data.identities[0].access_token);
    }

    private removeIDPToken() {
        store.remove('idp_token');
    }


    public getToken() {
        return store.get('tokens');
    }

    public getAPIManagementToken() {
        return store.get('apimanage_token').access_token;
    }

    public getIDPToken() {
        return store.get('idp_token');
    }


    public isSignedIn() {
        if (store.get('tokens')) {
            if (this.isAuthenticated()) {
                return true;
            } else {
                this.logout();
                return false;
            }
        }
    }

    public logout(): void {
        // Remove tokens and expiry time from localStorage
        store.remove('tokens');
        // Go back to the home route
        this.router.navigate(['/']);
    }

    public isAuthenticated(): boolean {
        // Check whether the current time is past the
        // Access Token's expiry time
        const expiresAt = JSON.parse(store.get('tokens').expires_at || '{}');
        return new Date().getTime() < expiresAt;
    }

    private isExpireAPIManagementToken() {
        if (store.get('idptoken')) {
            const expiresAt = JSON.parse(store.get('idptoken').expires_at || '{}');
            return new Date().getTime() < expiresAt;
        }
        return false;
    }

    public getProfile(cb): void {
        const accessToken = store.get('tokens').access_token;
        if (!accessToken) {
            throw new Error('Access Token must exist to fetch profile');
        }
        const self = this;
        this.auth0.client.userInfo(accessToken, (err, profile) => {
            cb(err, profile);
        });
    }
}
