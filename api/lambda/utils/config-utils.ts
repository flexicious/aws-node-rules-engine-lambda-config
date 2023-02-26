
import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ConfigJson } from "@euxdt/node-rules-engine";
import { Readable } from "stream";
import { getLambdaConfigApi, streamToString,LambdaConfigApi } from "@euxdt/lambda-config";
const s3Client = new S3Client({  });
const bucketParams = {
    Bucket: "lambda-accelerator-rules",
    Key: "config.json",
};

///This is where we load the config rules from S3. The config rules are stored in a JSON file in S3.
//we check to see if the config rules have been updated since the last time we loaded them. If they have, we load the new ones.
//If they haven't, we use the cached version. Config rules are published from the lambda genie console. 

export const loadConfigApi = async (lambdaName:string):Promise<LambdaConfigApi> => {
    const configApi = await getLambdaConfigApi(
        {
            lambdaName,
            loadConfig: async (lastRefreshed?:Date, existingConfig?:ConfigJson) => {
                if(lastRefreshed && existingConfig){
                    const head = await s3Client.send(new HeadObjectCommand(bucketParams));
                    if(lastRefreshed && head.LastModified && lastRefreshed.getTime() >= head.LastModified.getTime()){
                        console.log("Config is up to date");
                        return existingConfig;  
                    }
                }
                console.log("Loading Config");
                const file = await s3Client.send(new GetObjectCommand(bucketParams));
                const body = await streamToString(file.Body as Readable);
                console.log("Config Json",  body);
                const configJson = JSON.parse(body);
                console.log("Config Json", { configJson });
                return configJson as unknown as ConfigJson;
            },
            log: (level, message, extra) => {
                console.log(level, message, extra);
            }
        }
    );
    return configApi;
};
