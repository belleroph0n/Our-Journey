import { z } from "zod";

export const memorySchema = z.object({
  id: z.string(),
  title: z.string(),
  country: z.string(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  date: z.string(),
  description: z.string(),
  categories: z.array(z.string()).optional(),
  identifier: z.string().optional(),
  photoFiles: z.array(z.string()),
  videoFiles: z.array(z.string()).optional(),
  audioFiles: z.array(z.string()).optional(),
});

export type Memory = z.infer<typeof memorySchema>;

export const accessCodeSchema = z.object({
  code: z.string().min(1, "Access code is required"),
  rememberDevice: z.boolean().optional(),
});

export type AccessCodeForm = z.infer<typeof accessCodeSchema>;
