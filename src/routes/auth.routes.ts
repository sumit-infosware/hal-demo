import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/http.middleware.js";
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
} from "../schemas/auth.schemas.js";

export const authRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided registration information.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *                 requestId:
 *                   type: string
 *                   example: req-abc123
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post("/register", validate(registerSchema), registerUser);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user and returns an access token. A refresh token is set as an httpOnly cookie.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponse'
 *                 requestId:
 *                   type: string
 *                   example: req-abc123
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post("/login", validate(loginSchema), loginUser);

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Exchanges a valid refresh token (cookie or request body) for a new access token and rotated refresh token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       '200':
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                 requestId:
 *                   type: string
 *                   example: req-abc123
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post("/refresh-token", validate(refreshTokenSchema), refreshAccessToken);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Revokes the current refresh token (cookie or request body) and clears the refresh-token cookie.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *     responses:
 *       '200':
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                 requestId:
 *                   type: string
 *                   example: req-abc123
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post("/logout", validate(logoutSchema), logoutUser);
