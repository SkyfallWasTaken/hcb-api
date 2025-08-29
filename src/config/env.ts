import { type } from "arktype"

export const env = type({
  HCB_CLIENT_ID: "string",
  MASTER_KEY: "string"
}).assert(process.env)
