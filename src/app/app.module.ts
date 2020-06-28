import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatExpansionModule } from "@angular/material/expansion";
import { AppRoutingModule } from "./app.routing";
import { ComponentsModule } from "./components/components.module";

import { AppComponent } from "./app.component";

import { AgmCoreModule } from "@agm/core";
import { ListComponent } from "./list/list.component";
import { IonicModule } from "@ionic/angular";
import { ListService } from "./list/list.service";
import { CookieService } from "ngx-cookie-service";

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    MatAutocompleteModule,
    MatExpansionModule,
    AgmCoreModule.forRoot({
      apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    }),
    IonicModule.forRoot(),
  ],
  declarations: [AppComponent, ListComponent],
  providers: [ListService, CookieService],
  bootstrap: [AppComponent],
})
export class AppModule {}
