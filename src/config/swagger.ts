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
        RefreshTokenRequest: {
          type: "object",
          properties: {
            refreshToken: {
              type: "string",
              description:
                "Refresh token. Optional — if omitted, the httpOnly refresh_token cookie is used instead.",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        LogoutRequest: {
          type: "object",
          properties: {
            refreshToken: {
              type: "string",
              description:
                "Refresh token. Optional — if omitted, the httpOnly refresh_token cookie is used instead.",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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
        // User management schemas
        UserDetailResponse: {
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
            isActive: {
              type: "boolean",
              description: "Whether the user account is active",
              example: true,
            },
            roles: {
              type: "array",
              description: "Role names assigned to the user",
              items: {
                type: "string",
                example: "admin",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
              example: "2026-01-01T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
              example: "2026-01-02T12:30:00.000Z",
            },
          },
        },
        UserListResponse: {
          type: "object",
          properties: {
            users: {
              type: "array",
              items: {
                $ref: "#/components/schemas/UserDetailResponse",
              },
            },
            pagination: {
              type: "object",
              properties: {
                page: {
                  type: "integer",
                  example: 1,
                },
                limit: {
                  type: "integer",
                  example: 20,
                },
                total: {
                  type: "integer",
                  example: 42,
                },
                totalPages: {
                  type: "integer",
                  example: 3,
                },
              },
            },
          },
        },
        AssignRoleRequest: {
          type: "object",
          required: ["role"],
          properties: {
            role: {
              type: "string",
              description: "Name of the role to assign (replaces any existing roles)",
              example: "editor",
            },
          },
        },
        AssignRoleResponse: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              format: "uuid",
              description: "Identifier of the user the role was assigned to",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            role: {
              type: "string",
              description: "Name of the assigned role",
              example: "editor",
            },
          },
        },
        // RBAC schemas
        PermissionResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique permission identifier",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            code: {
              type: "string",
              description: "Unique permission code",
              example: "user.read",
            },
            description: {
              type: "string",
              description: "Human-readable description of the permission",
              example: "Allows reading user records",
            },
          },
        },
        RoleResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique role identifier",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            name: {
              type: "string",
              description: "Unique role name",
              example: "admin",
            },
            description: {
              type: "string",
              description: "Human-readable description of the role",
              example: "Full administrative access",
            },
            isSystem: {
              type: "boolean",
              description: "Whether the role is a protected system role",
              example: false,
            },
            permissions: {
              type: "array",
              description: "Permissions granted by this role",
              items: {
                type: "object",
                properties: {
                  code: {
                    type: "string",
                    example: "user.read",
                  },
                  description: {
                    type: "string",
                    example: "Allows reading user records",
                  },
                },
              },
            },
          },
        },
        RoleListResponse: {
          type: "array",
          items: {
            $ref: "#/components/schemas/RoleResponse",
          },
        },
        PermissionListResponse: {
          type: "array",
          items: {
            $ref: "#/components/schemas/PermissionResponse",
          },
        },
        // RBAC request schemas
        RoleCreateRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 80,
              description: "Unique role name",
              example: "manager",
            },
            description: {
              type: "string",
              maxLength: 255,
              description: "Human-readable description of the role",
              example: "Manages day-to-day operations",
            },
            permissionIds: {
              type: "array",
              description: "Permission ids to assign to the role",
              items: {
                type: "string",
                format: "uuid",
                example: "550e8400-e29b-41d4-a716-446655440000",
              },
            },
          },
        },
        RoleUpdateRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 80,
              description: "Unique role name",
              example: "manager",
            },
            description: {
              type: "string",
              nullable: true,
              maxLength: 255,
              description: "Human-readable description of the role (send null to clear)",
              example: "Manages day-to-day operations",
            },
            permissionIds: {
              type: "array",
              description: "Permission ids to assign to the role (fully replaces the existing set)",
              items: {
                type: "string",
                format: "uuid",
                example: "550e8400-e29b-41d4-a716-446655440000",
              },
            },
          },
        },
        PermissionCreateRequest: {
          type: "object",
          required: ["code"],
          properties: {
            code: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Unique permission code (lowercase, dot/underscore separated)",
              example: "roles.create",
            },
            description: {
              type: "string",
              maxLength: 255,
              description: "Human-readable description of the permission",
              example: "Allows creating roles",
            },
          },
        },
        PermissionUpdateRequest: {
          type: "object",
          properties: {
            code: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Unique permission code (lowercase, dot/underscore separated)",
              example: "roles.create",
            },
            description: {
              type: "string",
              nullable: true,
              maxLength: 255,
              description: "Human-readable description of the permission (send null to clear)",
              example: "Allows creating roles",
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
      {
        name: "Users",
        description: "User account and profile management endpoints",
      },
      {
        name: "RBAC",
        description: "Role and permission management endpoints (CRUD for roles and permissions)",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
