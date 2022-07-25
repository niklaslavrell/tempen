import { useEffect, useState } from "react";
import * as utils from "../utils";

export const usePersistedState = (
  key: string,
  storageType: "sessionStorage" | "localStorage" = "localStorage"
) => {
  const storage = utils.hasStorage
    ? storageType === "sessionStorage"
      ? sessionStorage
      : localStorage
    : undefined;
  const initialValue = storage?.getItem(key) || "";
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (value) {
      storage?.setItem(key, value);
    } else {
      storage?.removeItem(key);
    }
  }, [value, key, storage]);

  return [value, setValue] as const;
};
