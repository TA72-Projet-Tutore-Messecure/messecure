// Define the interface for parsed Matrix error
interface IMatrixErrorParts {
  errorCode: string;          // e.g., "M_LIMIT_EXCEEDED"
  errorType: string;          // e.g., "MatrixError"
  statusCode: number;         // e.g., 429
  message: string;           // e.g., "Too Many Requests"
  endpoint: string;          // e.g., "/_matrix/client/v3/login"
  host: string;              // e.g., "localhost:8008"
}

class MatrixErrorParser {
  /**
   * Parse a Matrix error message into its constituent parts
   * @param errorString The full error message to parse
   * @returns Parsed error parts or null if the string doesn't match expected format
   */
  static parse(errorString: string): IMatrixErrorParts | null {
    // Regular expression to match Matrix error format
    const regex = /^([A-Z_]+):\s*([^:]+):\s*\[(\d+)\]\s*([^(]+)\s*\((http[s]?:\/\/([^/]+)(.*?))\)$/;

    const match = errorString.match(regex);

    if (!match) {
      return null;
    }

    const [
      ,              // Full match (ignored)
      errorCode,     // Group 1: M_LIMIT_EXCEEDED
      errorType,     // Group 2: MatrixError
      statusCode,    // Group 3: 429
      message,       // Group 4: Too Many Requests
      fullUrl,       // Group 5: Full URL (unused)
      host,          // Group 6: localhost:8008
      endpoint       // Group 7: /_matrix/client/v3/login
    ] = match;

    return {
      errorCode,
      errorType,
      statusCode: parseInt(statusCode, 10),
      message: message.trim(),
      endpoint,
      host
    };
  }

  /**
   * Format a Matrix error parts object back into a string
   * @param parts The parsed error parts
   * @returns Formatted error string
   */
  static format(parts: IMatrixErrorParts): string {
    const url = `http://${parts.host}${parts.endpoint}`;
    return `${parts.errorCode}: ${parts.errorType}: [${parts.statusCode}] ${parts.message} (${url})`;
  }
}

export { MatrixErrorParser };
export type { IMatrixErrorParts };
