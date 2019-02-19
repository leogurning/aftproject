import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/root/components/home/home.component';
import { ErrorpageComponent } from './modules/root/components/errorpage/errorpage.component';
import { PagenotfoundComponent } from './modules/root/components/pagenotfound/pagenotfound.component';


const appRoutes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'errorpage', component: ErrorpageComponent},
    {path: '**', component: PagenotfoundComponent}
  ];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
