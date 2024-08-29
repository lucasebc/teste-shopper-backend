import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Measurement } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DuplicateConfirmationValidation implements NestMiddleware {
  constructor(private prisma: PrismaService){}

  async use(req: Request, res: Response, next: NextFunction) {
    const measurement: Measurement = await this.prisma.measurement.findFirst({
      where:{
        id: req.body.measure_uuid,
      }
    })

    if(measurement.has_confirmed) throw new HttpException({
 error_code: "CONFIRMATION_DUPLICATE",
 error_description: "Leitura do mês já realizada."}, HttpStatus.NOT_FOUND);

    next();
  }
}