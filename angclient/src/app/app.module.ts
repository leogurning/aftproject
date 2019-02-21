import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/* common Modules */
import { ToastrService } from './common/toastr.service';
import { DatePipe } from '@angular/common';

/* Root Modules */
import { AppComponent } from './app.component';
import { HomeComponent } from './modules/root/components/home/home.component';
import { NavbarComponent } from './modules/root/components/navbar/navbar.component';
import { FooterComponent } from './modules/root/components/footer/footer.component';
import { ErrorpageComponent } from './modules/root/components/errorpage/errorpage.component';
import { PagenotfoundComponent } from './modules/root/components/pagenotfound/pagenotfound.component';

/* Root routing module */
import { AppRoutingModule } from './app-routing.module';

/* Shared Angular Modules */
import { SharedModule } from './modules/shared/shared.module';

/* Services Modules */
import { ProjectsService } from './services/projects.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    FooterComponent,
    ErrorpageComponent,
    PagenotfoundComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
  ],
  providers: [
    ToastrService,
    ProjectsService,
    DatePipe,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
