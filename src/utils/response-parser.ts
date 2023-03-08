import { z } from "zod";

const ResponseSchema = z.object({
  data: z.any().optional(),
  error: z.any().optional(),
  statusCode: z.number().optional(),
  message: z.string(),
});

export default function parseResponse<T, D>(
  zodSchema: z.ZodSchema<T>,
  data: D
):
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: unknown;
    } {
  const response = ResponseSchema.parse(data);
  if (response.error) {
    return {
      error: response.error,
    };
  }
  if (!response.data) {
    return {
      error: new Error("No data found"),
    };
  }
  try {
    const data = zodSchema.parse(response.data);
    return {
      data,
    };
  } catch (error) {
    return {
      error,
    };
  }
}
