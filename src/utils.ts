const hasWindow = typeof window !== "undefined";

export const hasStorage =
  hasWindow &&
  window.localStorage !== undefined &&
  window.sessionStorage !== undefined;

export const hasPermissionsApi =
  hasWindow &&
  navigator.permissions !== undefined &&
  navigator.permissions.query !== undefined;

export const getHoursTwoDigit = (date: Date) =>
  ("0" + date.getHours()).slice(-2);

export const A_DAY_IN_MS = 1000 * 60 * 60 * 24;
