import { APIGatewayEvent } from "aws-lambda";
import { loadConfigApi } from "./utils/config-utils";


export const handler = async (event:APIGatewayEvent) => {
    const configApi = await loadConfigApi("TEST_LAMBDA");
    //const allConfigValues = (await configApi).getAllConfigValues();
    const configValue =  await configApi.getAllConfigValues("dev");
    //const configValue2 = await configApi.getConfigValue(CONFIG.GLOBAL_CONFIGS.GLOBAL_S3_VAL);
    //console.log("Config Value", { configValue, configValue2 });
    return {
        statusCode: 200,
        body: JSON.stringify(configValue),
    };
};

 