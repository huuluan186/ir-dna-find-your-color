import { z } from "zod";

export const submitQuizSchema = z.object({
	selected: z.array(z.number().int().positive()).min(1).max(50),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
