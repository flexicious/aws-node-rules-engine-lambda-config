import { Auth } from "aws-amplify";

export const awsExports = {
  Auth: {
    region: "us-east-2",
    userPoolId: "YOUR_USER_POOL_ID",
    userPoolWebClientId: "YOUR_USER_POOL_WEB_CLIENT_ID",
  },
  API:{
    endpoints: [
        {
            name: "api",
            endpoint: "/api",
            custom_header: async () => {
                return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` };
              }
      
        }
    ]
  }
};
