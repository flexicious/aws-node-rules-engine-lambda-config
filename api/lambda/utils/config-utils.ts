
import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ConfigJson } from "@euxdt/node-rules-engine";
import { Readable } from "stream";
import { getConfigApi, streamToString,LambdaConfigApi } from "@euxdt/lambda-config";
const s3Client = new S3Client({  });
const bucketParams = {
    Bucket: "lambda-accelerator-rules",
    Key: "config.json",
};
export const loadConfigApi = async (lambdaName:string):Promise<LambdaConfigApi> => {
    const configApi = await getConfigApi(
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
