import { z } from "zod";

const CreateConversationSchema = z.object({
  senderId: z
    .string({
      required_error: "Sender ID is required",
    })
    .uuid("Invalid sender ID"),
});
export const ChatValidation = {
  CreateConversationSchema,
};
export type CreateConversationType = z.infer<typeof CreateConversationSchema>;
