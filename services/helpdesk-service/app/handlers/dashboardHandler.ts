// File: services/helpdesk-service/app/handlers/dashboardHandler.ts
// CMS Dashboard Analytics
export const getDashboardStats = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        
        // Get counts from all entities
        const [
            heroSections,
            mediaFiles,
            surveys,
            contentSections,
            faqs,
            chatSessions,
            surveyResponses
        ] = await Promise.all([
            dataSource.getRepository('HeroSection').count({ where: { is_active: true } }),
            dataSource.getRepository('MediaLibrary').count({ where: { is_active: true } }),
            dataSource.getRepository('Survey').count({ where: { is_active: true } }),
            dataSource.getRepository('ContentSection').count({ where: { is_active: true } }),
            dataSource.getRepository('FAQ').count({ where: { is_active: true } }),
            dataSource.getRepository('ChatSession').count({ where: { status: 'active' } }),
            dataSource.getRepository('SurveyResponse').count()
        ]);

        // Get recent activity
        const recentActivity = await dataSource.getRepository('ContentSection')
            .createQueryBuilder('content')
            .select(['content.section_name', 'content.section_type', 'content.updated_at'])
            .orderBy('content.updated_at', 'DESC')
            .limit(10)
            .getMany();

        const stats = {
            overview: {
                hero_sections: heroSections,
                media_files: mediaFiles,
                surveys: surveys,
                content_sections: contentSections,
                faqs: faqs,
                active_chats: chatSessions,
                survey_responses: surveyResponses
            },
            recent_activity: recentActivity
        };

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: stats
            })
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch dashboard statistics'
            })
        };
    }
}).use(jsonBodyParser());
