import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

type ParseFormDataJsonConfig<T extends object> = {
  fieldName?: string;
  dtoClass?: new () => T;
};

/**
* Universal decorator for parsing JSON from multipart/form-data
* Supports the following formats:
* 1. body.data as a JSON string (from the FormData frontend)
* 2. body already contains DTO fields
* 3. body is a JSON string
* 4. body.data is already an object
*/

export const ParseFormDataJson = createParamDecorator(
  async <T extends object>(config: ParseFormDataJsonConfig<T>, ctx: ExecutionContext): Promise<T> => {
    const request = ctx.switchToHttp().getRequest();
    const body: unknown = request.body;

    try {
      let parsedData: object;

      if (config.fieldName) {
        const bodyObj = body as Record<string, unknown>;
        const fieldValue = bodyObj[config.fieldName];

        if (fieldValue === undefined || fieldValue === null) {
          throw new BadRequestException(`Field "${config.fieldName}" is required`);
        }

        if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue)) {
          parsedData = fieldValue as Record<string, unknown>;
        }
        else if (typeof fieldValue === 'string') {
          parsedData = JSON.parse(fieldValue) as Record<string, unknown>;
        }
        else {
          throw new Error(`Field "${config.fieldName}" must be a JSON string or object`);
        }
      }
      else {
        const bodyObj = body as Record<string, unknown>;

        if (bodyObj.data && typeof bodyObj.data === 'string') {
          parsedData = JSON.parse(bodyObj.data) as Record<string, unknown>;
        }
        else if (bodyObj.data && typeof bodyObj.data === 'object' && bodyObj.data !== null) {
          parsedData = bodyObj.data as Record<string, unknown>;
        }
        else if (bodyObj.name !== undefined || bodyObj.price !== undefined) {
          parsedData = bodyObj as Record<string, unknown>;
        }
        else if (typeof body === 'string') {
          parsedData = JSON.parse(body) as Record<string, unknown>;
        }
        else {
          throw new Error('Invalid request format');
        }
      }

      if (config.dtoClass) {
        const dtoInstance: T = plainToInstance(config.dtoClass, parsedData);

        const errors = await validate(dtoInstance, {
          whitelist: true,
          forbidNonWhitelisted: false,
          stopAtFirstError: false,
        });

        if (errors.length > 0) {
          const messages = errors.flatMap(error =>
            error.constraints ? Object.values(error.constraints) : []
          );
          throw new BadRequestException(messages.join('; '));
        }

        return dtoInstance;
      }

      return parsedData as T;

    } catch (error: unknown) {
      console.error(`ParseFormDataJson error:`, error);
      if (error instanceof BadRequestException) throw error;
      if (error instanceof SyntaxError) throw new BadRequestException('Invalid JSON format');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Invalid data format: ${errorMessage}`);
    }
  },
);

/**
 * A universal decorator for parsing DTOs from the 'data' field
 * Accepts a DTO class as a parameter
 */
export const ParseAndValidateDto = <T extends object>(dtoClass: new () => T) =>
  ParseFormDataJson({ fieldName: 'data', dtoClass });