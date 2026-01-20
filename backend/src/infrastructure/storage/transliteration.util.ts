// Transliteration of Cyrillic to Latin for use in S3 paths and metadata

export class TransliterationUtil {
  private static readonly transliterationMap: Record<string, string> = {
    // Ukrainian Cyrillic alphabet
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g',
    'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
    'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k',
    'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
    'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ь': '', 'ю': 'yu', 'я': 'ya',

    // Russian Cyrillic alphabet
    'ё': 'yo', 'ы': 'y', 'ъ': '', 'э': 'e',

    // Capital Ukrainian letters
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G',
    'Д': 'D', 'Е': 'E', 'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z',
    'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K',
    'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
    'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
    'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ь': '', 'Ю': 'Yu', 'Я': 'Ya',

    // Capital Russian letters
    'Ё': 'Yo', 'Ы': 'Y', 'Ъ': '', 'Э': 'E',
  };

  /**
   * Transliterates Cyrillic to Latin
   * @param text - Input text in Cyrillic
   * @returns Text transliterated to Latin
   */
  static transliterate(text: string): string {
    if (!text) return '';

    return text.split('').map(char => {
      return this.transliterationMap[char] || char;
    }).join('');
  }

  /**
   * Transliterates and sanitizes text for use in S3 paths
   * @param text - Input text
   * @returns Safe text for S3
   */
  static safeForS3Path(text: string): string {
    if (!text) return '';
    let result = this.transliterate(text);

    result = result
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    return result;
  }

  /**
   * Transliterates and sanitizes for use in S3 metadata
   * @param text - Input text
   * @returns Safe text for S3 metadata   
   */
  static safeForS3Metadata(text: string): string {
    if (!text) return '';
    let result = this.transliterate(text);
    // Leave only ASCII characters
    result = result.replace(/[^\x00-\x7F]/g, '');

    return result;
  }

  /**
   * Transliterates the filename
   * @param filename - Filename
   * @returns Secure filename for S3
   */
  static safeFileName(filename: string): string {
    if (!filename) return '';

    const lastDotIndex = filename.lastIndexOf('.');
    let name = filename;
    let extension = '';

    if (lastDotIndex !== -1) {
      name = filename.substring(0, lastDotIndex);
      extension = filename.substring(lastDotIndex);
    }

    const safeName = this.safeForS3Path(name);

    return safeName + extension;
  }
}


export const transliterate = (text: string): string =>
  TransliterationUtil.transliterate(text);

export const safeForS3Path = (text: string): string =>
  TransliterationUtil.safeForS3Path(text);

export const safeForS3Metadata = (text: string): string =>
  TransliterationUtil.safeForS3Metadata(text);

export const safeFileName = (filename: string): string =>
  TransliterationUtil.safeFileName(filename);