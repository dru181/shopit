import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { IonList } from "@ionic/angular";
import { ListService } from "./list.service";
import { Observable, BehaviorSubject } from "rxjs";
import { FormControl } from "@angular/forms";
import { map, finalize } from "rxjs/operators";
import { IFoodItem } from "./fooditem";
import { CookieService } from "ngx-cookie-service";
import { IRecipe } from "./recipe";
import { IRec } from "./rec";
import { IIngredient } from "./ingredient";
declare var $: any;
@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.css"],
})
export class ListComponent implements OnInit {
  @ViewChild("list") list: IonList;
  @Input() value: any;
  @Output() valueChange = new EventEmitter();
  totalPrice: number = 0;
  items: IFoodItem[] = [];
  newItem: IFoodItem;
  filteredOptions: BehaviorSubject<any[]> = new BehaviorSubject(undefined);
  recipes: IRecipe[] = [];
  ingredients: string[][] = [];
  myControl = new FormControl();
  total;
  loading = false;
  empty = false;

  constructor(private listService: ListService, private cookie: CookieService) {
    this.cookie.set("userid", this.makeid(5));
    this.myControl.valueChanges.subscribe((data) => {
      if (typeof data === "string" && data.trim() !== "") {
        this.filter(data);
      } else {
        this.filteredOptions.next([]);
      }
    });
  }

  ngOnInit(): void {
    this.myControl.setValue(this.value ? this.value : "");
  }

  private filter(search: string) {
    this.listService
      .getItems(search.toUpperCase())
      .subscribe((data) => this.filteredOptions.next(data));
  }

  public getDisplayFn() {
    return (val) => this.display(val);
  }

  private display(item): string {
    //access component "this" here
    return item ? item.name : item;
  }

  public addtoList(recipe: IRecipe, items: IFoodItem[], item: IFoodItem) {
    this.totalPrice += item.value;
    for (let i = 0; i < this.recipes.length; i++) {
      if (this.recipes[i].id == recipe.id) {
        const index: number = this.recipes[i].items.indexOf(items);
        if (index !== -1) {
          this.recipes[i].items.splice(index, 1);
        }
      }
    }

    this.showNotification("info", "Added " + item.name + " to cart");
    this.listService.putInCart(this.cookie.get("userid"), item.id);

    for (let i = 0; i < this.items.length; i++) {
      if (item.id == this.items[i].id) {
        const old_quantity = this.items[i].quantity++;

        this.items[i].value =
          (this.items[i].quantity * this.items[i].value) / old_quantity;
        this.updateTotalPrice();
        return;
      }
    }
    item.quantity = 1;
    this.items.push(item);
    this.updateTotalPrice();
  }

  private addRecommendedItems(
    recipe_index,
    recipe_ingredientsids: IIngredient[]
  ) {
    console.log(recipe_ingredientsids);
    this.recipes[recipe_index].items = [];

    for (let j = 0; j < recipe_ingredientsids.length; j++) {
      this.recipes[recipe_index].items[j] = [];
      this.recipes[recipe_index].items[j][0] = {
        category: recipe_ingredientsids[j].description,
      };

      this.listService
        .getRecommendedItems(recipe_ingredientsids[j].id)
        .subscribe((cart_items_ids) => {
          for (let k = 0; k < cart_items_ids.length; k++) {
            this.listService
              .getItem(cart_items_ids[k])
              .subscribe((cart_item) => {
                cart_item.category = recipe_ingredientsids[j].description;
                this.recipes[recipe_index].items[j][k] = cart_item;
              });
          }
        });
    }
  }

  public recommend() {
    this.loading = true;

    this.recipes = [];
    var ingredientids: number[][] = [];

    this.listService
      .getRec(this.cookie.get("userid"))
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((rec) => {
        if (rec.length == 0) {
          this.showNotification(
            "danger",
            "No recipe recommendation can be made! Try adding more products"
          );
        }

        for (let i = 0; i < rec.length; i++) {
          this.listService.getRecipe(rec[i].recipe).subscribe((recipe) => {
            this.recipes[i] = recipe;
            this.addRecommendedItems(i, rec[i].ingredients);
            console.log(this.recipes);
          });
        }
      });
  }

  public selected(item) {
    this.value = item;
    //send to parent or do whatever you want to do
    this.valueChange.emit(item);
  }

  add_quantity(item) {
    const old_quantity = item.quantity++;
    item.value = (item.quantity * item.value) / old_quantity;
    this.updateTotalPrice();
  }

  pushItem() {
    if (this.newItem.name != undefined) {
      for (let i = 0; i < this.items.length; i++) {
        if (this.newItem.id == this.items[i].id) {
          const old_quantity = this.items[i].quantity++;
          this.items[i].value =
            (this.items[i].quantity * this.items[i].value) / old_quantity;
          this.updateTotalPrice();
          this.newItem = undefined;
          return;
        }
      }

      this.newItem.quantity = 1;
      this.listService.putInCart(this.cookie.get("userid"), this.newItem.id);
      this.items.push(this.newItem);
      this.updateTotalPrice();
      this.newItem = undefined;
      this.restart();
    }
  }
  updateTotalPrice() {
    let temp = 0;
    for (let i = 0; i < this.items.length; i++) {
      temp += this.items[i].value;
    }
    this.totalPrice = temp;
  }

  remove(item) {
    if (item.quantity > 1) {
      const old_quantity = item.quantity--;
      item.value = (item.quantity * item.value) / old_quantity;
      this.updateTotalPrice();
      return;
    }

    this.items.splice(this.items.indexOf(item), 1);
    this.updateTotalPrice();
    this.list.closeSlidingItems();
    this.listService.deleteFromCart(this.cookie.get("userid"), item.id);

    this.restart();
  }

  restart() {
    if (this.recipes.length > 0) {
      this.showNotification(
        "warning",
        "Removed recipe recommendations due to change in cart"
      );
      this.recipes = [];
    }
  }

  makeid(length) {
    var result = "";
    var characters = "0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  showNotification(type, message) {
    $.notify(
      {
        icon: "notifications",
        message: message,
      },
      {
        type: type,
        timer: 200,
        placement: {
          from: "top",
          align: "center",
        },
        template:
          '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
          '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
          '<i class="material-icons" data-notify="icon">notifications</i> ' +
          '<span data-notify="title">{1}</span> ' +
          '<span data-notify="message">{2}</span>' +
          '<div class="progress" data-notify="progressbar">' +
          '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
          "</div>" +
          '<a href="{3}" target="{4}" data-notify="url"></a>' +
          "</div>",
      }
    );
  }
}
