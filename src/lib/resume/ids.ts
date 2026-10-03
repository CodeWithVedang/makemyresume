import { nanoid } from "nanoid";

/** Client-safe id for resume entries; matches the schema's id pattern. */
export function createId(): string {
  return nanoid(16);
}
