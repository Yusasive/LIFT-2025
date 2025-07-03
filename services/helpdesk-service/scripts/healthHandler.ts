// File: services/helpdesk-service/app/handlers/healthHandler.ts
// Health Check Handler
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import { getDataSource } from '../config/database';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

export const healthCheck = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const startTime = Date.now();
    
    try {
        // Check database connection
        const dataSource = await getDataSource();
        const dbCheck = await dataSource.query('SELECT 1 as status');
        
        // Check environment
        const nodeEnv = process.env.NODE_ENV || 'development';
        const version = process.env.npm_package_version || '1.0.0';
        
        // Calculate response time
        const responseTime = Date.now() - startTime;
        
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'helpdesk-service',
            version,
            environment: nodeEnv,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: {
                status: dbCheck ? 'connected' : 'disconnected',
                responseTime: `${responseTime}ms`
            },
            endpoints: {
                faq: '/faq',
                hero_sections: '/hero-sections',
                media: '/media',
                surveys: '/surveys',
                content_sections: '/content-sections',
                chat: '/chat',
                docs: '/docs'
            }
        };

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: healthData
            })
        };
    } catch (error) {
        console.error('Health check failed:', error);
        
        return {
            statusCode: 503,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                service: 'helpdesk-service',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
});
