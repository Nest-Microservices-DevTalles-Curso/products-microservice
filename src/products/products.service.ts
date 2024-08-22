import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit{
  
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Prisma connected.');
  }
  
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {

    const {page, limit} = paginationDto;
    const totalPages = await this.product.count({where: {available: true}});
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          available: true
        }
      }),
      meta: {
        page: page,
        total: totalPages,
        lastPage: lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: {
        id: id,
        available: true
      }
    });

    if (!product) {
      throw new NotFoundException(`Product with id #${id} not found.`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    delete updateProductDto.id;

    await this.findOne(id);

    return this.product.update({
      where: {id: id},
      data: updateProductDto
    });
  }

  async remove(id: number) {
    
    await this.findOne(id);
    
    /* Physical delete */
    // return this.product.delete({
    //   where: { id }
    // });
  
    const product = await this.product.update({
      where: { id },
      data: {
        available: false
      }
    });

    return product;
  }
}
