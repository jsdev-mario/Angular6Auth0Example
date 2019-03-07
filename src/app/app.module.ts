import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthService } from './auth/auth.service';
import { GapiService } from './gapi/gapi.service';
import { HomeComponent } from './home/home.component';
import { CallbackComponent } from './callback/callback.component';


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        CallbackComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        AppRoutingModule,
    ],
    providers: [
        AuthService,
        GapiService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
