import type { Repository } from "typeorm";
import { User } from "../entity/User.js";
import type { UserData } from "../types/index.js";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { Role } from "../constants/index.js";

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Role.Customer,
            });
        } catch (err) {
            console.log(err);

            const error = createHttpError(500, "Failed to store data in db");
            throw error;
        }
    }
}
