import { type } from "arktype"

export const env = type({
  HCB_CLIENT_ID: "string",
  MASTER_KEY: "string",
  "TOKEN_FILE_PATH": "string = 'token.json'"
}).assert(process.env)
