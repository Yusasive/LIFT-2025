import { execSync } from 'child_process';
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';


async function getSSMParameters() {
  const ssm = new SSMClient({ region: 'eu-north-1' });
  const stage = process.env.STAGE || 'dev';
  
  const params = await ssm.send(new GetParametersCommand({
    Names: [
      `/litf-${stage}/base-url`
    ],
    WithDecryption: true
  }));

  const envVars = {
    VITE_SERVICE_BASE_URL: params.Parameters.find(p => p.Name.includes('base-url'))?.Value,
    VITE_ENVIRONMENT: stage
  };

  return envVars;
}

async function build() {
  try {
    // Get SSM parameters
    const envVars = await getSSMParameters();
    
    // Set environment variables for the build process
    Object.entries(envVars).forEach(([key, value]) => {
      process.env[key] = value;
    });
    
    // Run build command
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 