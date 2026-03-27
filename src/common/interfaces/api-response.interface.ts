import { ERROR_MESSAGE } from '../constants/error-message.constant';

// This file defines the structure of API responses for the application. It includes a base interface and specific classes for object, list, and error responses.
export interface APIBaseResponse<T> {
  DataError: number;
  DataErrorDescription?: string;
  DataResult?: T;
  DataResults?: T[];
}
// For single item response, DataResults will be null
export class APIObjectResponse<T> implements APIBaseResponse<T> {
  DataError: number;
  DataErrorDescription?: string;
  DataResult?: T;

  constructor(data: T, message?: string) {
    this.DataError = 0;
    this.DataResult = data;
    this.DataErrorDescription = message ?? ERROR_MESSAGE.SUCCESS;
  }
}
// For list response, DataResult will be null
export class APIListResponse<T> implements APIBaseResponse<T> {
  DataError: number;
  DataErrorDescription?: string;
  DataResults?: T[];

  constructor(data: T[]) {
    this.DataError = 0;
    this.DataErrorDescription = ERROR_MESSAGE.SUCCESS;
    this.DataResults = data;
  }
}
// For error response, DataResult and DataResults will be null
export class APIErrorResponse implements APIBaseResponse<null> {
  DataError: number;
  DataErrorDescription?: string;

  constructor(message: string, code = 1) {
    this.DataError = code;
    this.DataErrorDescription = message;
  }
}
