import { Schema, model, Document } from "mongoose";

interface IComment extends Document {
  postId: Schema.Types.ObjectId;
  content: string;
  sender: Schema.Types.ObjectId;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: { type: String, required: true },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Comment = model<IComment>("Comment", CommentSchema, "comments");

export default Comment;
