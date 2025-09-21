import { type } from "arktype"

export const newAppSchema = type({
  name: type("string.trim").to("string > 0")
});