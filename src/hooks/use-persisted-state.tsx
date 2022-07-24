import { useEffect, useState } from "react";

export const usePersistedState = (
  key: string,
  storageType: "sessionStorage" | "localStorage" = "localStorage"
) => {
  const storage =
    typeof window !== "undefined" &&
    window.localStorage &&
    window.sessionStorage
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
