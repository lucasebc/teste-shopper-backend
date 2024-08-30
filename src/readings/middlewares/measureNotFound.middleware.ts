import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common'
import { Measurement } from '@prisma/client'
import { Request, Response, NextFunction } from 'express'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class MeasurementNotFound implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const measurement: Measurement = await this.prisma.measurement.findFirst({
      where: {
        id: req.body.measure_uuid,
      },
    })

    if (!measurement)
      throw new HttpException(
        {
          error_code: 'MEASURE_NOT_FOUND',
          error_description: 'Leitura não encontrada.',
        },
        HttpStatus.NOT_FOUND,
      )

    next()
  }
}
