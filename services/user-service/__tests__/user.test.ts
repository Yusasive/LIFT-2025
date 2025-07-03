import { APIGatewayProxyEventV2 } from "aws-lambda";
import { baseHandler } from '../app/handlers/userHandler';
import { UserRepository } from '../app/repository/userRepository';
import * as passwordUtils from '../app/utility/password';

// Set environment variables for testing
process.env.AUTH_SERVICE_URL = 'http://localhost:4000';
process.env.INTERNAL_SERVICE_KEY = 'INTERNAL_SERVICE_KEY';

// Mock dependencies
jest.mock('../app/repository/userRepository');
jest.mock('../app/utility/password');
describe('User Service Endpoints', () => {
  const mockRequestContext = {
    accountId: 'test-account',
    apiId: 'test-api',
    domainName: 'test-domain',
    domainPrefix: 'test',
    http: {
      method: 'POST',
      path: '/signup',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'jest-test'
    },
    requestId: 'test-request',
    routeKey: 'POST /signup',
    stage: 'test',
    time: new Date().toISOString(),
    timeEpoch: Date.now()
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock UserRepository methods
    (UserRepository as jest.Mock).mockImplementation(() => ({
      createAccount: jest.fn().mockResolvedValue({
        user_id: '123',
        email: 'test@example.com',
        phone: '+1234567890',
        user_type: 'CUSTOMER',
        first_name: 'Test',
        last_name: 'User',
        verified: false,
        profile_pic: null,
        verification_code: null,
        expiry: null,
        stripe_id: null,
        payment_id: null,
        address: []
      }),
      getUserProfile: jest.fn().mockResolvedValue({
        user_id: '123',
        email: 'profile@test.com',
        phone: '+1234567890',
        user_type: 'CUSTOMER',
        first_name: 'Profile',
        last_name: 'Test',
        verified: false,
        profile_pic: null,
        verification_code: null,
        expiry: null,
        stripe_id: null,
        payment_id: null,
        address: []
      })
    }));

    // Mock password utilities
    (passwordUtils.GetSalt as jest.Mock).mockResolvedValue('test-salt');
    (passwordUtils.GetHashedPassword as jest.Mock).mockResolvedValue('hashed-password');
  });

  describe('POST /signup - Create User', () => {
    it('should create a new user successfully', async () => {
      const event = {
        version: '2.0',
        routeKey: 'POST /signup',
        rawPath: '/signup',
        rawQueryString: '',
        headers: {
          'content-type': 'application/json'
        },
        requestContext: {
          ...mockRequestContext,
          http: {
            ...mockRequestContext.http,
            method: 'POST',
            path: '/signup'
          },
          requestId: 'test-123',
          stage: '$default'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test123!',
          phone: '1234567890',
          user_type: 'CUSTOMER'
        }),
        isBase64Encoded: false
      } as unknown as APIGatewayProxyEventV2;

      const response = await baseHandler(event);
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveProperty('_id');
      expect(body.data).toHaveProperty('email', 'test@example.com');
    });

    it('should return 400 for invalid input', async () => {
      const event = {
        version: '2.0',
        routeKey: 'POST /signup',
        rawPath: '/signup',
        rawQueryString: '',
        headers: {
          'content-type': 'application/json'
        },
        requestContext: {
          ...mockRequestContext,
          http: {
            ...mockRequestContext.http,
            method: 'POST',
            path: '/signup'
          },
          requestId: 'test-123',
          stage: '$default'
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123'
        }),
        isBase64Encoded: false
      } as unknown as APIGatewayProxyEventV2;

      const response = await baseHandler(event);
      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /profile - Get User Profile', () => {
    it('should get user profile', async () => {
      // First create a user and get token
      const signupEvent = {
        version: '2.0',
        routeKey: 'POST /signup',
        rawPath: '/signup',
        rawQueryString: '',
        headers: {
          'content-type': 'application/json'
        },
        requestContext: {
          ...mockRequestContext,
          http: {
            ...mockRequestContext.http,
            method: 'POST',
            path: '/signup'
          },
          requestId: 'test-123',
          stage: '$default'
        },
        body: JSON.stringify({
          email: 'profile@test.com',
          password: 'Test123!',
          phone: '1234567890',
          user_type: 'CUSTOMER'
        }),
        isBase64Encoded: false
      } as unknown as APIGatewayProxyEventV2;

      const signupResponse = await baseHandler(signupEvent);
      const signupBody = JSON.parse(signupResponse.body);
      const token = signupBody.data.token;

      const event = {
        version: '2.0',
        routeKey: 'GET /profile',
        rawPath: '/profile',
        rawQueryString: '',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        requestContext: {
          ...mockRequestContext,
          http: {
            ...mockRequestContext.http,
            method: 'GET',
            path: '/profile'
          },
          requestId: 'test-123',
          stage: '$default'
        },
        isBase64Encoded: false
      } as unknown as APIGatewayProxyEventV2;

      const response = await baseHandler(event);
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toEqual({
        user_id: '123',
        email: 'profile@test.com',
        first_name: 'Profile',
        last_name: 'Test',
        phone: '+1234567890',
        user_type: 'CUSTOMER',
        address: [],
        verified: false,
        profile_pic: null,
        verification_code: null,
        expiry: null,
        stripe_id: null,
        payment_id: null,
        
      });
    });
  });
}); 