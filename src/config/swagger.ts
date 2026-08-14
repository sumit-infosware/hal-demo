import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env.js";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "HAL SIT API",
      version: "1.0.0",
      description: "API documentation for HAL SIT backend services",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT access token obtained from login endpoint",
        },
      },
      schemas: {
        // Request schemas
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "firstName", "lastName"],
          properties: {
            email: {
              type: "string",
              format: "email",
              maxLength: 254,
              description: "User's email address",
              example: "john@example.com",
            },
            password: {
              type: "string",
              minLength: 8,
              maxLength: 128,
              description: "User's password (min 8, max 128 characters)",
              example: "StrongPassword123!",
            },
            firstName: {
              type: "string",
              minLength: 1,
              maxLength: 80,
              description: "User's first name",
              example: "John",
            },
            lastName: {
              type: "string",
              minLength: 1,
              maxLength: 80,
              description: "User's last name",
              example: "Doe",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
              example: "john@example.com",
            },
            password: {
              type: "string",
              minLength: 1,
              description: "User's password",
              example: "StrongPassword123!",
            },
          },
        },
        // Response schemas
        UserResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique user identifier",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
              example: "john@example.com",
            },
            firstName: {
              type: "string",
              description: "User's first name",
              example: "John",
            },
            lastName: {
              type: "string",
              description: "User's last name",
              example: "Doe",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/UserResponse",
            },
            accessToken: {
              type: "string",
              description: "JWT access token for authentication",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              description: "JWT refresh token for obtaining new access tokens",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Health check live succesfull.",
            },
            status: {
              type: "integer",
              example: 200,
            },
            response: {
              type: "null",
              nullable: true,
            },
          },
        },
        // Error schemas
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  example: "VALIDATION_ERROR",
                },
                message: {
                  type: "string",
                  example: "Validation failed",
                },
                details: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: {
                        type: "string",
                        example: "email",
                      },
                      message: {
                        type: "string",
                        example: "Invalid email format",
                      },
                    },
                  },
                },
                stack: {
                  type: "string",
                  description: "Stack trace (only in development)",
                },
              },
            },
            requestId: {
              type: "string",
              description: "Unique request identifier for tracing",
              example: "req-abc123",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              description: "Response data (varies by endpoint)",
            },
            requestId: {
              type: "string",
              description: "Unique request identifier for tracing",
              example: "req-abc123",
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Bad Request - Validation failed",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message: "Validation failed",
                  details: [
                    { field: "email", message: "Invalid email format" },
                    { field: "password", message: "Password must be at least 8 characters" },
                  ],
                },
                requestId: "req-abc123",
              },
            },
          },
        },
        Unauthorized: {
          description: "Unauthorized - Invalid or missing credentials",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: {
                  code: "UNAUTHORIZED",
                  message: "Invalid credentials",
                },
                requestId: "req-abc123",
              },
            },
          },
        },
        Forbidden: {
          description: "Forbidden - Insufficient permissions",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: {
                  code: "FORBIDDEN",
                  message: "You do not have permission to perform this action",
                },
                requestId: "req-abc123",
              },
            },
          },
        },
        NotFound: {
          description: "Not Found - Resource does not exist",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: {
                  code: "NOT_FOUND",
                  message: "Resource not found",
                },
                requestId: "req-abc123",
              },
            },
          },
        },
        Conflict: {
          description: "Conflict - Resource already exists",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: {
                  code: "CONFLICT",
                  message: "Email already registered",
                },
                requestId: "req-abc123",
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: {
                  code: "INTERNAL_ERROR",
                  message: "Something went wrong",
                },
                requestId: "req-abc123",
              },
            },
          },
        },
        ServiceUnavailable: {
          description: "Service Unavailable",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: {
                  code: "SERVICE_UNAVAILABLE",
                  message: "Service temporarily unavailable",
                },
                requestId: "req-abc123",
              },
            },
          },
        },
      },
    },
    security: [],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and registration endpoints",
      },
      {
        name: "Health",
        description: "Health check endpoints for monitoring",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
