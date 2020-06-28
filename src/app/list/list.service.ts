import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Injectable } from "@angular/core";
import { IFoodItem } from "./fooditem";
import { IRecipe } from "./recipe";
import { IRec } from "./rec";

@Injectable()
export class ListService {
  _url = "http://80.83.124.210:8080";

  config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  constructor(private http: HttpClient) {}

  public getItems(query): Observable<any> {
    console.log(this._url + "/item?q=" + query);
    return this.http.get<IFoodItem>(this._url + "/item?q=" + query);
  }

  public getItem(id) {
    return this.http.get<IFoodItem>(this._url + "/item?id=" + id);
  }

  public putInCart(userid, itemid) {
    this.http
      .post(
        this._url + "/basket?user_id=" + userid + "&item_id=" + itemid,
        null,
        this.config
      )
      .subscribe({
        error: (error) => console.error("There was an error!", error),
      });
  }

  public deleteFromCart(userid, itemid) {
    this.http
      .delete(this._url + "/basket?user_id=" + userid + "&item_id=" + itemid)
      .subscribe({
        error: (error) => console.error("There was an error!", error),
      });
  }

  public getRec(userid): Observable<any> {
    return this.http.get<IRec>(this._url + "/recommend?user_id=" + userid);
  }

  getRecommendedItems(ingredientid): Observable<any> {
    console.log(this._url + "/recommend/ingredient?id=" + ingredientid);
    return this.http.get<number[]>(
      this._url + "/recommend/ingredient?id=" + ingredientid
    );
  }

  // Get recipe information and initially store in recipes list
  public getRecipe(recipeid) {
    return this.http.get<IRecipe>(this._url + "/recipe?id=" + recipeid);
  }
}
