import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

import { PaginationDto } from '../common/dto/pagination.dto';


@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {


  private readonly logger = new Logger('ProductsService');


  onModuleInit() {

    this.$connect();
    // console.log('Database connected');
    this.logger.log('Database connected');


  }



  create(createProductDto: CreateProductDto) {

    return this.product.create({
      data: createProductDto
    })

    // return createProductDto;
  }

  async findAll(PaginationDto: PaginationDto) {

    const { page, limit } = PaginationDto;

    const totalProducts = await this.product.count({ where: { available: true } });

    const lastPage = Math.ceil(totalProducts / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true }
      }),
      meta: {
        total: totalProducts,
        page: page,
        lastPage: lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id: id, available: true }
    });
    if (!product) {
      throw new RpcException({
        message: `Product with id #${id} not found`,
        status: HttpStatus.BAD_REQUEST
      });
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: data,
    })
  }

  async remove(id: number) {

    await this.findOne(id);

    // return this.product.delete({
    //   where: { id }
    // })

    const product = await this.product.update({
      where: { id },
      data: {
        available: false
      }
    })
    return product;
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  
    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return products;
  }

}
