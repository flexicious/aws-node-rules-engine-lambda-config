import { executeRule } from "@euxdt/node-rules-engine";
import { APIGatewayEvent } from "aws-lambda";
import { getUserInformation } from "./utils/auth-utils";
import { CONFIG } from "./utils/config-bindings";
import { loadConfigApi } from "./utils/config-utils";
import { PRODUCTS } from "./utils/products";

export interface Response {
    slot1: string;
    slot2: string;
    slot3: string;
    slot4: string;
    slot1Products: any[];
    slot2Products: any[];
    slot3Products: any[];
    slot4Products: any[];
    featuredProducts: FeaturedProduct[];
    nextGenFeature:boolean;
    

}
export interface FeaturedProduct {
    Id: string;
    Product_Name: string;
    Selling_Price: number;
    Image: string;
    Discount_Percent: number;
    Product_Url: string;
}

export interface SlotNames {
    slot1: string;
    slot2: string;
    slot3: string;
    slot4: string;
    maxProducts: number;
  }
  

  

export const handler = async (event:APIGatewayEvent) => {
    const user = getUserInformation(event);
    if (!user) {
        return {
            statusCode: 401,
            body: "Unauthorized"
        };
    }

    const environment = "dev";
    const configApi = await loadConfigApi("GET_PRODUCTS");
    const slotNames = JSON.parse(await configApi.getConfigValue(CONFIG.LAMBDA_CONFIGS.GET_PRODUCTS.SLOT_NAMES,environment)) as SlotNames;

    const slot1 = [slotNames.slot1] ||["Home & Kitchen"];
    const slot2 = [slotNames.slot2] ||  [ "Clothing, Shoes & Jewelry"];
    const slot3 = [slotNames.slot3] || ["Learning & Education"];
    const slot4 = [slotNames.slot4] ||  ["Hobbies"];
    const maxProducts = slotNames.maxProducts ||  4;

    const featuredProducts = JSON.parse(await configApi.getConfigValue(CONFIG.LAMBDA_CONFIGS.GET_PRODUCTS.FEATURED_PRODUCTS,environment)) as FeaturedProduct[];
    const slot2Rules= configApi.configJson.ruleSets.find((ruleSet) => ruleSet.name === CONFIG.RULE_SETS.HOME_PAGE_PERSONALIZATION);
    const userInfo= {
        ...user,
        age: user.birthdate ? Math.floor((new Date().getFullYear() - new Date(user.birthdate).getFullYear())) : 25
    };
    if(slot2Rules){
        const slot2RuleResult = executeRule(slot2Rules,
        configApi.configJson.predefinedLists, userInfo,environment);
        if(slot2RuleResult && slot2RuleResult.result){
            slot2.push(String(slot2RuleResult.result));
        }
    }
    let nextGenFeature = false;
    const featureFlagRules= configApi.configJson.ruleSets.find((ruleSet) => ruleSet.name === CONFIG.RULE_SETS.NEXT_GEN_FEATURE);
    if(featureFlagRules){
        const featureFlagRuleResult = executeRule(featureFlagRules,
        configApi.configJson.predefinedLists, userInfo,environment);
        nextGenFeature = featureFlagRuleResult.result ? true : false;
        console.log("featureFlagRuleResult", featureFlagRuleResult);
    }                

    const getProducts = (slot: string[]) => {
        return PRODUCTS.filter((product) => {
            return slot.every((category) => {
                return product.categories.includes(category);
            });
        }).slice(0, maxProducts);
    };


    const slot1Products = getProducts(slot1);
    const slot2Products = getProducts(slot2);
    const slot3Products = getProducts(slot3);
    const slot4Products = getProducts(slot4);

    return {
        statusCode: 200,
        body: JSON.stringify({
            slot1: slot1[0],
            slot2: slot2[0],
            slot3: slot3[0],
            slot4: slot4[0],
            slot1Products,
            slot2Products,
            slot3Products,
            slot4Products,
            featuredProducts,
            nextGenFeature
        }),
    };
};

 