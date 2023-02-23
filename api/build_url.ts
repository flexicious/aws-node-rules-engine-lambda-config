import {
    S3Client,
    PutObjectCommand }
  from "@aws-sdk/client-s3";
  import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import { existsSync } from "fs";

const signS3URL = async () => {
    const s3Params = {
        Bucket: "lambda-accelerator-rules",
        Key: "config.json",
    };
    const s3 = new S3Client({})
    const command = new PutObjectCommand(s3Params);
    try {
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3000 });
        //check if config.json exists, if it does, upload to a new version

        if(existsSync("./config.json")){
            console.log("uploading new version");
            await s3.send(new PutObjectCommand({
                Bucket: "lambda-genie-rules",
                Key: "config.json",
                Body: JSON.stringify(require("./config.json")),
            }));
            console.log("uploaded new version");
        }
        console.log(signedUrl);
    } catch (err) {
        console.error(err);
    }
}

signS3URL();