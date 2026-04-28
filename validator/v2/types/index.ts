interface Rule<T> {
    check: (value: T) => boolean;
    message: string;
}

type ParseResult<T> =
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

type TypeofResult = "string" | "number" | "boolean" | "object" | "undefined";
