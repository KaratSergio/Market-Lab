import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LanguageCode, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@domain/translations/types';

export const Locale = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): LanguageCode => {
    const request = ctx.switchToHttp().getRequest();
    const header = request.headers['accept-language'];

    if (!header) return DEFAULT_LANGUAGE;

    // "uk-UA,uk;q=0.9,en;q=0.8" → "uk"
    const extractedCode = header
      .split(',')[0]
      .split('-')[0]
      .toLowerCase()
      .trim();

    const supportedLanguages = Object.values(SUPPORTED_LANGUAGES);

    if (!supportedLanguages.includes(extractedCode as LanguageCode)) {

      return DEFAULT_LANGUAGE;
    }

    return extractedCode as LanguageCode;
  },
);