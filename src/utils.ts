export const canCheckPermission =
  typeof window !== "undefined" &&
  navigator.permissions !== undefined &&
  navigator.permissions.query !== undefined;

export const getHoursTwoDigit = (date: Date) =>
  ("0" + date.getHours()).slice(-2);

export const A_DAY_IN_MS = 1000 * 60 * 60 * 24;
