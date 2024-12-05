import { Schema, model, Document } from "mongoose";

interface IPost extends Document {
  title: string;
  content: string;
  sender: Schema.Types.ObjectId;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Post = model<IPost>("Post", PostSchema, "posts");

export default Post;
