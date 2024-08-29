import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Measurement } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NoMeasurementsFound implements NestMiddleware {
  constructor(private prisma: PrismaService){}

  async use(req: Request, res: Response, next: NextFunction) {
    const measureType: string = req.query.measure_type as string
    console.log({
        client_id: req.params.id,
        ...(measureType && {type: measureType})
      })
    
    const measurements: Measurement[] = await this.prisma.measurement.findMany({
      where:{
        client_id: req.params.id,
        ...(measureType && {type: measureType.toUpperCase()})
      }
    })

    if(measurements.length === 0) throw new HttpException({
 error_code: "MEASURES_NOT_FOUND",
 error_description: "Nenhuma leitura"}, HttpStatus.NOT_FOUND);

    next();
  }
}