export interface Rule<T> {
    check: (value: T) => boolean;
    message: string;
}

export type ParseResult<T> =
    | {
          success: false;
          errors: string[];
          data: unknown;
      }
    | {
          success: true;
          errors: [];
          data: T;
      };

export type TypeofResult = "string" | "number" | "boolean" | "object" | "undefined";
