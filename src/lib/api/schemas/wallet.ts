import { z } from "zod";

export const transferBodySchema = z.object({
  toUserId: z.string().min(1, "toUserId es obligatorio").transform((s) => s.trim()),
  amount: z.coerce.number().positive("amount debe ser positivo"),
  reason: z.string().max(500).optional().transform((s) => (s?.trim() || undefined)),
});

export type TransferBody = z.infer<typeof transferBodySchema>;
