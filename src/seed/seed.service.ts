import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService
  ) {}

  runSeed() {
    this.insertNewProduct();
    return `seed executed`;
  }


  private async insertNewProduct() {
    this.productService.deleteAllProducts();

    const products = initialData.products;
    const insertPromises = [];
    products.forEach( product => {
      insertPromises.push(this.productService.create(product));
    });

    await Promise.all(insertPromises);

    return true;
  }

}
