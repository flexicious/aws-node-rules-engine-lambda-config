import { Logger } from "@aws-lambda-powertools/logger";
import { APIGatewayEvent, APIGatewayProxyCognitoAuthorizer } from "aws-lambda";

const logger = new Logger({ serviceName: 'LambdaAccelerator' });

export const getUserInformation =  (event: APIGatewayEvent) => {
    const authContext = event.requestContext.authorizer as APIGatewayProxyCognitoAuthorizer;
    const user = {
        userId: authContext?.claims.sub,
        name: authContext?.claims.name,
        email: authContext?.claims.email,
        emailVerified: authContext?.claims.email_verified === 'true',
        gender: authContext?.claims.gender,
        birthdate: authContext?.claims.birthdate,
    };
    return user;
}