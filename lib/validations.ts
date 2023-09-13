import * as z from "zod";

export const pageLimitSchema = z.object({
  page: z
    .preprocess((a) => parseInt(z.string().parse(a)), z.number().min(0))
    .optional(),
  limit: z
    .preprocess((a) => parseInt(z.string().parse(a)), z.number().min(1))
    .optional(),
});

export const collectionsSearchSchema = z.object({
  query: z.string(),
  page: pageLimitSchema.shape.page,
  limit: pageLimitSchema.shape.limit,
});

export const collectionsUpdateSchema = z.object({
  secret: z.string(),
});
