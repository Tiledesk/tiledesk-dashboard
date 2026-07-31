import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GroupsStaticComponent } from './groups-static.component';
import { SettingsSidebarModule } from 'app/components/settings-sidebar/settings-sidebar.module';
import { TranslateModule } from '@ngx-translate/core';
import { StaticPagesCarouselModule } from '../static-pages-carousel/static-pages-carousel.module';

const routes: Routes = [
  { path: "", component: GroupsStaticComponent},
];

@NgModule({
  declarations: [
    GroupsStaticComponent
  ],
  
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SettingsSidebarModule,
    TranslateModule,
    StaticPagesCarouselModule,
  ]
})
export class GroupsStaticModule { }
