import { readFileSync ,writeFileSync} from "fs";

/*
Uniq Id,Product Name,Brand Name,Asin,Category,Upc Ean Code,List Price,Selling Price,Quantity,Model Number,About Product,Product Specification,Technical Details,Shipping Weight,Product Dimensions,Image,Variants,Sku,Product Url,Stock,Product Details,Dimensions,Color,Ingredients,Direction To Use,Is Amazon Seller,Size Quantity Variant,Product Description
4c69b61db1fc16e7013b43fc926e502d,"DB Longboards CoreFlex Crossbow 41"" Bamboo Fiberglass Longboard Complete",,,"Sports & Outdoors | Outdoor Recreation | Skates, Skateboards & Scooters | Skateboarding | Standard Skateboards & Longboards | Longboards","",,$237.68,,"","Make sure this fits by entering your model number. | RESPONSIVE FLEX: The Crossbow features a bamboo core encased in triaxial fiberglass and HD plastic for a responsive flex pattern that’s second to none. Pumping & carving have never been so satisfying! Flex 2 is recommended for people 120 to 170 pounds. | COREFLEX TECH: CoreFlex construction is water resistant, impact resistant, scratch resistant and has a flex like you won’t believe. These boards combine fiberglass, epoxy, HD plastic and bamboo to create a perfect blend of performance and strength. | INSPIRED BY THE NORTHWEST: Our founding ideal is chasing adventure & riding the best boards possible, inspired by the hills, waves, beaches & mountains all around our headquarters in the Northwest | BEST IN THE WORLD: DB was founded out of sheer love of longboarding with a mission to create the best custom longboards in the world, to do it sustainably, & to treat customers & employees like family | BEYOND COMPARE: Try our skateboards & accessories if you've tried similar products by Sector 9, Landyachtz, Arbor, Loaded, Globe, Orangatang, Hawgs, Powell-Peralta, Blood Orange, Caliber or Gullwing",Shipping Weight: 10.7 pounds (View shipping rates and policies)|ASIN: B07KMVJJK7|    #474    in Longboards Skateboard,"",10.7 pounds,"",https://images-na.ssl-images-amazon.com/images/I/51j3fPQTQkL.jpg|https://images-na.ssl-images-amazon.com/images/I/31hKM3cSoSL.jpg|https://images-na.ssl-images-amazon.com/images/I/51WlHdwghfL.jpg|https://images-na.ssl-images-amazon.com/images/I/51FsyLRBzwL.jpg|https://images-na.ssl-images-amazon.com/images/G/01/x-locale/common/transparent-pixel.jpg,https://www.amazon.com/DB-Longboards-CoreFlex-Fiberglass-Longboard/dp/B07KMVJJK7|https://www.amazon.com/DB-Longboards-CoreFlex-Fiberglass-Longboard/dp/B07KMN5KS7|https://www.amazon.com/DB-Longboards-CoreFlex-Fiberglass-Longboard/dp/B07KMXK857|https://www.amazon.com/DB-Longboards-CoreFlex-Fiberglass-Longboard/dp/B07KMW2VFR,,https://www.amazon.com/DB-Longboards-CoreFlex-Fiberglass-Longboard/dp/B07KMVJJK7,,,,,,,Y,,
*/
    const csvStringToArray = strData =>
{
    const objPattern = new RegExp(("(\\,|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\\,\\r\\n]*))"),"gi");
    let arrMatches = null, arrData = [[]];
    while (arrMatches = objPattern.exec(strData)){
        if (arrMatches[1].length && arrMatches[1] !== ",")arrData.push([]);
        arrData[arrData.length - 1].push(arrMatches[2] ? 
            arrMatches[2].replace(new RegExp( "\"\"", "g" ), "\"") :
            arrMatches[3]);
    }
    return arrData;
}


const trimAndRemoveQuotes = (str) => {
  return (str||"").trim().replace(/"/g, "");
};

const distinctCategories = [];

const parseFile = ()=> {
  const file = readFileSync("data.csv", "utf8");
  const lines = csvStringToArray(file)
  const headers = lines[0];
  const productsToSave = [];
  const products/* : Product[] */ = [];
  for (let i = 1; i < 1000; i++) {
    const product= {};
    const currentline = lines[i];
    for (let j = 0; j < headers.length; j++) {
      product[headers[j].replace(/ /g, "_")] = trimAndRemoveQuotes(currentline[j]);
    }
    if(product.Category){
      product.categories = product.Category.length>0?product.Category.split(" | ").map(trimAndRemoveQuotes):[];
      
      products.push(product);
      const {
        Product_Name,
        Image,
        Selling_Price,
        Product_Url,
        categories
      } = product;
      productsToSave.push({
        Product_Name,
        Image,
        Selling_Price,
        Product_Url,
        categories
      });

      product.categories.forEach((c)=>{
        if(!distinctCategories.includes(c)){
          distinctCategories.push(c);
        }
      });
    }
  }
  const largeCategories = []
  for(const Category of distinctCategories){
    const productsInCategory = products.filter((p)=>p.categories.includes(Category));
    if(productsInCategory.length>20){
      largeCategories.push(Category);
    }
    console.log(Category, productsInCategory.length);
  }
  console.log(largeCategories.length);
  console.log(products[0]);
  writeFileSync("categories.txt", largeCategories.sort().join("\n"))
  writeFileSync("products.json", JSON.stringify(productsToSave, null, 2));
  return products;
};

parseFile();



