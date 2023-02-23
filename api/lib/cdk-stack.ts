import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Create a Cognito User Pool
    const userPool = new cognito.UserPool(this, 'MyUserPool', {
      userPoolName: 'my-user-pool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create a Cognito User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, 'MyUserPoolClient', {
      userPool,
      userPoolClientName: 'my-user-pool-client'
    });



    const configHandler = new NodejsFunction(this, "ConfigHandler", {
      entry: "lambda/config.ts",
      handler: "handler",
      logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
    });


    const configTable = dynamodb.Table.fromTableName(this, "ConfigTable", "CONFIG_TABLE");
    configTable.grantReadData(configHandler);
    const secret = secretsmanager.Secret.fromSecretNameV2(this, "TestSecret", "prod/test_secret");
    secret.grantRead(configHandler);
    const param = ssm.StringParameter.fromStringParameterName(this, "TestParam", "/prod/test_param");
    param.grantRead(configHandler);
    const bucket = s3.Bucket.fromBucketName(this, "TestBucket", "lambda-accelerator-rules");
    bucket.grantRead(configHandler);


    const getProductsHandler = new NodejsFunction(this, "GetProductsHandler", {
      entry: "lambda/getProducts.ts",
      handler: "handler",
      logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
    });

    bucket.grantRead(getProductsHandler);

    // Create an Authorizer for the API Gateway REST API
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'MyAuthorizer', {
      cognitoUserPools: [userPool]
    });


    const productsApi = new apigateway.RestApi(this, "ProductsApi", {
      restApiName: "Products Service",
      description: "This service serves products.",
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.COGNITO,
        authorizer: authorizer
      }
    });



    const config = productsApi.root.addResource("config");
    const getConfigIntegration = new apigateway.LambdaIntegration(configHandler);
    config.addMethod("GET", getConfigIntegration);

    const products = productsApi.root.addResource("products");
    const getProductsIntegration = new apigateway.LambdaIntegration(getProductsHandler);
    products.addMethod("GET", getProductsIntegration);
  }
}
