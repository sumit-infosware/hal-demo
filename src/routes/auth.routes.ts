import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { validate } from "../middleware/http.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";

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
 *     description: Authenticates a user and returns access and refresh tokens.
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

// authRouter.post("/refresh",)

// authRouter.post("/logout",)

// authRouter.get("/me",)
