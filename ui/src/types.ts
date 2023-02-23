export interface Product {
    Product_Name: string;
    Image: string;
    Selling_Price: number;
    Discount_Percent: number;
    Product_Url: string;
    categories: string[];
  }
  export interface ProductApiResponse {
    slot1: string;
    slot2: string;
    slot3: string;
    slot4: string;
    slot1Products: Product[];
    slot2Products: Product[];
    slot3Products: Product[];
    slot4Products: Product[];
    featuredProducts: Product[];
    nextGenFeature:boolean;
  }