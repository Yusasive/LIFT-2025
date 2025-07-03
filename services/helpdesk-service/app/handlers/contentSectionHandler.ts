import "reflect-metadata";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

// DISABLED: Content sections are now handled by user-service
// This handler is disabled to prevent conflicts with user-service CMS
export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log(
    "Content section handler called but disabled - redirecting to user-service"
  );

  const origin = event.headers.origin || "http://localhost:3011";

  return {
    statusCode: 404,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With, Accept, Origin",
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, DELETE",
      "Access-Control-Allow-Credentials": "true",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: false,
      error:
        "Content sections are handled by user-service. Please use port 4001 for CMS APIs.",
      redirect: "http://localhost:4001/api/content-sections",
    }),
  };
};
