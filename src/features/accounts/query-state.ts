import { parseAsArrayOf, parseAsString } from "nuqs";

export const sortOptions = {
  sort: {
    defaultValue: "desc",
    parse: (v: string) => (v === "asc" ? "asc" : "desc"),
    serialize: (v: string) => v,
  },
  category: parseAsArrayOf(parseAsString).withDefault([] as string[]),
  type: parseAsArrayOf(parseAsString).withDefault([] as string[]),
};
