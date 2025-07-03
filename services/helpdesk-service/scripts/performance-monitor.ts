// File: services/helpdesk-service/scripts/performance-monitor.ts
// Performance Monitoring Script
class PerformanceMonitor {
    private metrics: Array<{
        endpoint: string;
        method: string;
        responseTime: number;
        timestamp: Date;
        status: number;
    }> = [];

    async startMonitoring(intervalMs: number = 30000) {
        console.log('📊 Starting performance monitoring...');
        
        setInterval(async () => {
            await this.checkEndpoints();
            this.analyzeMetrics();
        }, intervalMs);
    }

    private async checkEndpoints() {
        const endpoints = [
            { method: 'GET', path: '/health' },
            { method: 'GET', path: '/faq' },
            { method: 'GET', path: '/hero-sections' },
            { method: 'GET', path: '/media' },
            { method: 'GET', path: '/surveys' },
            { method: 'GET', path: '/content-sections' }
        ];

        for (const endpoint of endpoints) {
            const startTime = Date.now();
            
            try {
                const response = await fetch(`http://localhost:4003${endpoint.path}`);
                const responseTime = Date.now() - startTime;
                
                this.metrics.push({
                    endpoint: endpoint.path,
                    method: endpoint.method,
                    responseTime,
                    timestamp: new Date(),
                    status: response.status
                });
                
                // Keep only last 100 metrics per endpoint
                this.metrics = this.metrics.slice(-1000);
                
            } catch (error) {
                console.error(`Failed to check ${endpoint.path}:`, error);
            }
        }
    }

    private analyzeMetrics() {
        if (this.metrics.length === 0) return;

        const recentMetrics = this.metrics.filter(
            m => Date.now() - m.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
        );

        const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
        const slowRequests = recentMetrics.filter(m => m.responseTime > 1000).length;
        const errorRate = recentMetrics.filter(m => m.status >= 400).length / recentMetrics.length * 100;

        console.log(`\n📈 Performance Summary (Last 5 minutes):`);
        console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
        console.log(`Slow Requests (>1s): ${slowRequests}`);
        console.log(`Error Rate: ${errorRate.toFixed(1)}%`);
        console.log(`Total Requests: ${recentMetrics.length}`);

        // Alert on performance issues
        if (avgResponseTime > 2000) {
            console.log('⚠️  WARNING: High average response time detected!');
        }
        
        if (errorRate > 5) {
            console.log('🚨 ALERT: High error rate detected!');
        }
    }

    getMetricsReport() {
        return {
            totalRequests: this.metrics.length,
            averageResponseTime: this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.length,
            endpointBreakdown: this.getEndpointBreakdown(),
            recentErrors: this.metrics.filter(m => m.status >= 400).slice(-10)
        };
    }

    private getEndpointBreakdown() {
        const breakdown: Record<string, any> = {};
        
        this.metrics.forEach(metric => {
            if (!breakdown[metric.endpoint]) {
                breakdown[metric.endpoint] = {
                    count: 0,
                    totalTime: 0,
                    errors: 0
                };
            }
            
            breakdown[metric.endpoint].count++;
            breakdown[metric.endpoint].totalTime += metric.responseTime;
            
            if (metric.status >= 400) {
                breakdown[metric.endpoint].errors++;
            }
        });

        // Calculate averages
        Object.keys(breakdown).forEach(endpoint => {
            const data = breakdown[endpoint];
            data.averageResponseTime = data.totalTime / data.count;
            data.errorRate = (data.errors / data.count) * 100;
        });

        return breakdown;
    }
}

// Export for use
export { PerformanceMonitor };
