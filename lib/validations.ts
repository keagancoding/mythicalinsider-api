import * as z from "zod";

export const pageLimitSchema = z.object({
  page: z
    .preprocess((a) => parseInt(z.string().parse(a)), z.number().min(0))
    .optional(),
  limit: z
    .preprocess((a) => parseInt(z.string().parse(a)), z.number().min(1))
    .optional(),
  sortby: z.string().optional(),
});

export const collectionsSearchSchema = z.object({
  query: z.string().optional(),
  name: z.string().optional(),
  rarity: z.string().optional(),
  program: z.string().optional(),
  categroy: z.string().optional(),
  tier: z.string().optional(),
  edition: z.string().optional(),
  page: pageLimitSchema.shape.page,
  limit: pageLimitSchema.shape.limit,
});

export const collectionsUpdateSchema = z.object({
  secret: z.string(),
});
