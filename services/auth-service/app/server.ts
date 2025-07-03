import { UserServiceClient } from './clients/userServiceClient';

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down from SIGINT (Ctrl+C)');
    
    try {
        // Cleanup service clients
        UserServiceClient.cleanup();
        
        // Add any other cleanup tasks here
        
        console.log('Cleanup completed');
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
});

// Handle termination signals
process.on('SIGTERM', async () => {
    console.log('\nGracefully shutting down from SIGTERM');
    
    try {
        // Cleanup service clients
        UserServiceClient.cleanup();
        
        // Add any other cleanup tasks here
        
        console.log('Cleanup completed');
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}); 