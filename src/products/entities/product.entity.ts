import { ApiProperty } from '@nestjs/swagger';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { User } from "src/auth/entities/user.entity";
import { ProductImage } from "./";

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: '0edf1352-499d-4828-9bbe-57d79eb007c0',
        description: 'Product uuid',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-shirt teslo',
        description: 'Title of the item',
        uniqueItems: true
    })
    @Column('text', { unique: true })
    title: string;

    @ApiProperty({
        example: 110,
        description: 'Product price',
    })
    @Column('float', { default: 0 })
    price: number;

    @ApiProperty({
        example: 'Lorem ipsum',
        description: 'Product description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 'tshirt_teslo',
        description: 'Product slug for SEO',
        uniqueItems: true
    })
    @Column('text', { unique: true })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @ApiProperty()
    @Column('int', { default: 0 })
    stock: number;

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product size'
    })
    @ApiProperty()
    @Column('text', { array: true })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product gender'
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['shrit', 'kids', 'baby'],
        description: 'Product tags'
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true }
    )
    user: User

    @BeforeInsert()
    checkSlugInsert() {
        this.checkSlug();
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.checkSlug();
    }

    private checkSlug() {
        if (!this.slug) {
            this.slug = this.title;
        }
        this.slug = this.slug.toLocaleLowerCase().replaceAll(' ', '_').replaceAll("'", "");
    }
}
