import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { resourceLimits } from 'worker_threads';
import { Product } from './entities/product.entity';

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

    const totalPages = await this.product.count({where: {available:true}});

    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true }
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id : id, available: true  }
    });
    if (!product) {
      throw new NotFoundException(`Product with id #${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: updateProductDto,
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
}
