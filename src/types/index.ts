import type { Request } from "express";

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface UserLoginData {
    email: string;
    password: string;
}

export interface LoginUserRequest extends Request {
    body: UserLoginData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
    };
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload {
    id: string;
}

export interface ITenant {
    name: string;
    address: string;
}

export interface TenantQueryParams {
    q: string;
    perPage: number;
    currentPage: number;
}

export interface TenantQueryId {
    id: number;
}

export interface TenantValidatedRequest extends Request {
    body: ITenant;
    validatedQuery?: TenantQueryParams;
    validatedParams?: TenantQueryId;
}
