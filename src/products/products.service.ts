import { NotFoundException } from '@nestjs/common';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isUUID } from 'uuid';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {

    try {
      const { images = [], ...productDeatails } = createProductDto;

      const producto = this.productRepository.create({
        ...productDeatails,
        images: images.map( img => this.productImageRepository.create({ url: img }) ),
        user
      });

      await this.productRepository.save(producto);

      return { ...producto, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 5 } = paginationDto;
    const productos = await this.productRepository.find({
      take: limit,
      skip: offset,

      relations: {
        images: true
      }
    });
    return productos.map( (product) => ({
      ...product,
      images: product.images.map(img => img.url)
    }));
  }

  async findOne(term: string) {
    let product: Product;

    try {
      if (isUUID(term)) {
        product = await this.productRepository.findOneBy({ id: term });
      } else {
        const queryBuilder = this.productRepository.createQueryBuilder('prod');
        product = await queryBuilder.where(`UPPER(title)=:title or slug=:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
      }

      if (!product) {
        throw new NotFoundException(`Product with term: ${term} was not found.`)
      }

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async finddOnePlain( term: string ) {
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate} = updateProductDto;
    const product = await this.productRepository.preload({ id, ...toUpdate });

    if ( !product ) {
      throw new NotFoundException(`Product with id: ${ id } was not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if ( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id } });
        product.images = images.map(
          (img) => this.productImageRepository.create({ url: img })
        );
      }

      product.user = user;
      await queryRunner.manager.save( product );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      // await this.productRepository.save(product);
      return this.finddOnePlain( id );

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id);
      await this.productRepository.remove(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Ocurrió un error un error inesperado');
  }

  async deleteAllProducts() {
    console.log(`deleteAllProducts on environment: ${process.env.NODE_ENV}`);
    if (process.env.NODE_ENV === 'development') {
      const query = this.productRepository.createQueryBuilder('product');

      try {
        return await query.delete().where({}).execute();
      } catch (error) {
        this.handleDBExceptions(error);
      }
    }
  }
}
