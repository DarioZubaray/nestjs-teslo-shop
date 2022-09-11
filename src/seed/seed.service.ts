import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { ProductsService } from 'src/products/products.service';
import { User } from '../auth/entities/user.entity';
import { initialData } from './data/seed';

@Injectable()
export class SeedService {

    constructor(
        private readonly productService: ProductsService,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    async runSeed() {
        await this.deleteTables();
        const adminsUser = await this.insertUsers();

        await this.insertNewProduct(adminsUser);
        return `seed executed`;
    }

    private async deleteTables() {
        await this.productService.deleteAllProducts();

        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder.delete().where({}).execute();
    }

    private async insertUsers() {
        const seedUsers = initialData.users;

        const users: User[] = [];
        seedUsers.forEach(user => {
            user.password = bcrypt.hashSync(user.password, 10);
            users.push(this.userRepository.create(user))
        });

        const dbUsers = await this.userRepository.save(users);

        return dbUsers[0];
    }

    private async insertNewProduct(user: User) {
        this.productService.deleteAllProducts();

        const products = initialData.products;
        const insertPromises = [];
        products.forEach(product => {
            insertPromises.push(this.productService.create(product, user));
        });

        await Promise.all(insertPromises);

        return true;
    }

}
