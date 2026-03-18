import type { NextFunction, Response } from "express";
import { UserService } from "../services/UserService.js";
import type { AuthenticatedCreateUserRequest, LimitedUserData,  UserLimitedDataRequest, UserQuery, UserValidatedRequest } from "../types/index.js";
import type { Logger } from "winston";
import createHttpError from "http-errors";

export class UserController {
    constructor(
        private userService : UserService,
        private logger : Logger
    ){}
    async create(req:AuthenticatedCreateUserRequest,res:Response,next:NextFunction) {

        
        
        const { firstName, lastName, email, password, tenantId } = req.body;
        const role = req.auth.role
        
        try {
            
            console.log("role is",firstName, lastName, email, password, tenantId, role );
            

        const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role  ,
                tenantId,
            });
            res.json({
                id : user.id
            })

        } catch (error) {
            next(error)
        }


        

    }

    async getOne(req:UserValidatedRequest,res:Response,next:NextFunction) {

        const userId  = req.validatedParams?.id ;
        

        try {
            
            const user = await this.userService.findById(Number(userId));

            if(!user){
                const error = createHttpError(400,"User does not exist")
                next(error);
                return;
            }

            this.logger.info("User Fetched successfully!");

            res.json(
                user
            )

        } catch (error) {
            next(error)
        }


        

    }

    async update(req:UserLimitedDataRequest,res:Response,next:NextFunction) {

        const { firstName , lastName, role, email, tenantId  } : LimitedUserData = req.body;

        const userId  = req.validatedParams?.id ;
        

        try {
            
            const user = await this.userService.update( Number(userId),  {firstName , lastName, role, email, tenantId});


            if(!user){
                const error = createHttpError(400,"User does not exist")
                next(error);
                return;
            }
            

            this.logger.info("User Updated successfully!");

            res.json(
                user
            )

        } catch (error) {
            next(error)
        }


        

    }

    async destroy(req:UserValidatedRequest,res:Response,next:NextFunction) {

        const userId  = req.validatedParams?.id ;
        

        try {
            
            await this.userService.deleteOne(Number(userId));

            this.logger.info("User Deleted successfully.", {
                id: Number(userId),
            });

            res.json({
                id : Number(userId)
            }
            )

        } catch (error) {
            next(error)
        }


        

    }

    async getList(req:UserValidatedRequest,res:Response,next:NextFunction) {


        const validatedQuery = req.validatedQuery as UserQuery;

        try {
            

            const [user, count] = await this.userService.getAll(validatedQuery);

            this.logger.info("All user have been fetched");

            res.json({
                currentPage: validatedQuery.currentPage,
                perPage: validatedQuery.perPage,
                total: count,
                data: user,
            });

        } catch (error) {
            next(error)
        }


        

    }

}