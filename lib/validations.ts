import * as z from "zod";

export const pageLimitSchema = z.object({
  page: z
    .preprocess((a) => parseInt(z.string().parse(a), 10), z.number().positive())
    .optional(),
  limit: z
    .preprocess((a) => parseInt(z.string().parse(a), 10), z.number().positive())
    .optional(),
});

export const collectionsSearchSchema = z.object({
  query: z.string(),
  ...pageLimitSchema.shape,
});

export const collectionsUpdateSchema = z.object({
  secret: z.string(),
});
