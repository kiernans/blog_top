import { Prisma } from '@genPrisma/client';

// Define a type for the error response structure for type-safety and consistency
type ErrorResponse = {
  title: string;
  status: number;
  detail: string;
  // Add other fields as needed (e.g., specific error codes or metadata)
  code?: string;
  meta?: Record<string, any>;
};

/**
 * Creates a structured JSON error object for Prisma errors.
 * @param error The Prisma error object.
 * @returns A JSON object representing the error.
 */
export function formatPrismaError(error: unknown): ErrorResponse {
  // Default values for unknown errors
  let title = 'Internal Server Error';
  let status = 500;
  let detail = 'An unexpected error occurred.';
  let code: string | undefined;
  let meta: Record<string, any> | undefined;

  // Handle specific Prisma error types
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    code = error.code;
    meta = error.meta;

    switch (error.code) {
      case 'P2000': // Value too long
        title = 'Bad Request';
        status = 400;
        detail = `The provided value for a column is too long: ${error.message}`;
        break;
      case 'P2002': // Unique constraint violation
        title = 'Conflict';
        status = 409;
        detail = `A unique constraint failed on the field: ${error.meta?.target}`;
        break;
      case 'P2003': // Foreign key constraint violation
        title = 'Conflict';
        status = 409;
        detail = `A foreign key constraint failed: ${error.message}`;
        break;
      case 'P2025': // Record not found
        title = 'Not Found';
        status = 404;
        detail = `The record could not be found: ${error.message}`;
        break;
      // Add more cases for other Prisma error codes as needed based on your application's requirements.
      // You can find a comprehensive list of Prisma error codes in the {Link: Prisma documentation https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors}.
      default:
        // Generic handling for other PrismaClientKnownRequestError types
        title = 'Bad Request';
        status = 400;
        detail = `Prisma error: ${error.message}`;
        break;
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    title = 'Internal Server Error';
    status = 500;
    detail = `An unknown Prisma error occurred: ${error.message}`;
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    title = 'Internal Server Error';
    status = 500;
    detail = `A Prisma Rust panic occurred: ${error.message}`;
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    title = 'Internal Server Error';
    status = 500;
    detail = `A Prisma client initialization error occurred: ${error.message}`;
  } else if (error instanceof Error) {
    // Handle generic Error instances that might not be Prisma specific
    title = 'Internal Server Error';
    status = 500;
    detail = error.message;
  }

  // Construct and return the error object
  return { title, status, detail, code, meta };
}
