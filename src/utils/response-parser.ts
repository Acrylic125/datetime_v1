import { z } from "zod";

const ResponseSchema = z.object({
  data: z.any().optional(),
  error: z.any().optional(),
  statusCode: z.number().optional(),
  message: z.string(),
});

export default function parseResponse<T, D>(zodSchema: z.ZodSchema<T>, data: D): T {
  const response = ResponseSchema.parse(data);
  if (response.error) {
    throw new Error(response.error);
  }
  if (!response.data) {
    throw new Error("No data in response");
  }
  return zodSchema.parse(response.data);
}
