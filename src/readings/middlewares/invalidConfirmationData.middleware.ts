import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { validate as uuidValidate } from 'uuid'

@Injectable()
export class InvalidDataValidation implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const {
      measure_uuid,
      confirmed_value,
    }: { measure_uuid: string; confirmed_value: number } = req.body

    // verify if both fields are present and measure_uuid is an uuid.
    if (!measure_uuid || !confirmed_value || !uuidValidate(measure_uuid))
      throw new HttpException(
        {
          error_code: 'INVALID_DATA',
          error_description: 'Dados enviados estão incorretos.',
        },
        HttpStatus.BAD_REQUEST,
      )

    next()
  }
}
