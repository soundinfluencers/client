import { ObjectId } from "bson";

export const oid = () => new ObjectId().toHexString();

export const isMongoId = (s: unknown) =>
  typeof s === "string" && /^[a-f\d]{24}$/i.test(s);
