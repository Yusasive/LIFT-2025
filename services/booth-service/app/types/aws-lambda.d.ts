import { APIGatewayProxyEventV2 } from 'aws-lambda';

declare module 'aws-lambda' {
    interface APIGatewayEventRequestContextV2 {
        authorizer?: {
            jwt: {
                claims: any;
            };
        };
    }
} 