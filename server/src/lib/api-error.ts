export type TranslatedMessage = {
  en: string;
  am: string;
};

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly translatedMessage: TranslatedMessage;

  constructor(
    statusCode: number,
    code: string,
    translatedMessage: TranslatedMessage,
  ) {
    super(translatedMessage.en);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.translatedMessage = translatedMessage;
  }
}