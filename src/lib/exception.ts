import { StatusCodes } from "http-status-codes";

export class Exception extends Error {
  constructor(public statusCode: StatusCodes, public message: string) {
    super(message);
  }
}
