// File: services/helpdesk-service/app/handlers/bulkOperationsHandler.ts
// Bulk Operations for CMS
export const bulkUpdateStatus = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const { entity_type, ids, status } = event.body as { entity_type: string, ids: string[], status: boolean };
        
        let repository;
        switch (entity_type) {
            case 'hero_sections':
                repository = dataSource.getRepository('HeroSection');
                break;
            case 'content_sections':
                repository = dataSource.getRepository('ContentSection');
                break;
            case 'media_files':
                repository = dataSource.getRepository('MediaLibrary');
                break;
            case 'faqs':
                repository = dataSource.getRepository('FAQ');
                break;
            default:
                throw new Error('Invalid entity type');
        }

        await repository
            .createQueryBuilder()
            .update()
            .set({ is_active: status })
            .whereInIds(ids)
            .execute();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: `Updated ${ids.length} items`
            })
        };
    } catch (error) {
        console.error('Error in bulk update:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to perform bulk update'
            })
        };
    }
}).use(jsonBodyParser());

export const bulkDelete = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const { entity_type, ids } = event.body as { entity_type: string, ids: string[] };
        
        let repository;
        switch (entity_type) {
            case 'hero_sections':
                repository = dataSource.getRepository('HeroSection');
                break;
            case 'content_sections':
                repository = dataSource.getRepository('ContentSection');
                break;
            case 'media_files':
                repository = dataSource.getRepository('MediaLibrary');
                // For media, we soft delete by setting is_active to false
                await repository
                    .createQueryBuilder()
                    .update()
                    .set({ is_active: false })
                    .whereInIds(ids)
                    .execute();
                break;
            case 'faqs':
                repository = dataSource.getRepository('FAQ');
                break;
            default:
                throw new Error('Invalid entity type');
        }

        if (entity_type !== 'media_files') {
            await repository.delete(ids);
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: `Deleted ${ids.length} items`
            })
        };
    } catch (error) {
        console.error('Error in bulk delete:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to perform bulk delete'
            })
        };
    }
}).use(jsonBodyParser());
