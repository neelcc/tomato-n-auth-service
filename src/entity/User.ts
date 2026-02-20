import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar" })
    firstName: string;

    @Column({ type: "varchar" })
    lastName: string;

    @Column({ type: "varchar", unique: true })
    email: string;

    @Column({ type: "varchar", select: false })
    password: string;

    @Column({ type: "varchar", default: "customer" })
    role: string;
}
