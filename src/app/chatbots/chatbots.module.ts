import { RouterModule, Routes } from "@angular/router";
import { ChatbotsComponent } from "./chatbots.component";
import { NgModule } from "@angular/core";
import { BotsSidebarModule } from "app/bots/bots-list/bots-sidebar/bots-sidebar.module";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { BotsListModule } from "app/bots/bots-list/bots-list.module";
import { BotListComponent } from "app/bots/bots-list/bots-list.component";

const routes: Routes = [
    { path: "", component: ChatbotsComponent}
];

@NgModule({
    declarations: [
        ChatbotsComponent,
        BotListComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        BotsSidebarModule,
        CommonModule,
        TranslateModule
    ]
})
export class ChatbotsModule {}