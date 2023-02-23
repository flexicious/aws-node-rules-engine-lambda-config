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
    const userPool = new cognito.UserPool(this, 'MyUserPool', {
      userPoolName: 'my-user-pool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'MyUserPoolClient', {
      userPool,
      userPoolClientName: 'my-user-pool-client'
    });



    const configHandler = new NodejsFunction(this, "ConfigHandler", {
      entry: "lambda/config.ts",
      handler: "handler",
      logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
    });

    const configTable = new dynamodb.Table(this, "ConfigTable", {
      partitionKey: {
        name: "lambdaName",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "configKey",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    configTable.grantReadData(configHandler);


    const secret = new secretsmanager.Secret(this, "TestSecret", {
      secretName: "prod/test_secret1",
    });
    secret.grantRead(configHandler);


    const param = new ssm.StringParameter(this, "TestParam", {
      parameterName: "/prod/test_param1",
      stringValue: "test",
    });
    param.grantRead(configHandler);

    const bucket = s3.Bucket.fromBucketName(this, "TestBucket", "lambda-accelerator-rules");
    bucket.grantRead(configHandler);
    const getProductsHandler = new NodejsFunction(this, "GetProductsHandler", {
      entry: "lambda/getProducts.ts",
      handler: "handler",
      logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
    });

    bucket.grantRead(getProductsHandler);

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

    new cdk.CfnOutput(this, "ProductsApiUrl", {
      value: productsApi.url,
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    
  }
}
