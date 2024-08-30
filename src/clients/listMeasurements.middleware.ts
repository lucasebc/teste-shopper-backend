import { HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { ListMeasurementDTO } from './client.dto'

export function listMeasurementsValidation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const measureType: string = req.query?.measure_type as string

  // validates if measure_type is 'gas' or 'water'
  if (
    measureType &&
    measureType.toUpperCase() !== 'GAS' &&
    measureType.toUpperCase() !== 'WATER'
  )
    throw new HttpException(
      {
        error_code: 'INVALID_TYPE',
        error_description: `Tipo de medição não permitida.`,
      },
      HttpStatus.BAD_REQUEST,
    )

  next()
}
