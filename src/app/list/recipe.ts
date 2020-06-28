import { IFoodItem } from "./fooditem";

export interface IRecipe {
  id?: number;
  title?: string;
  instructions?: string;
  items?: IFoodItem[][];
}
