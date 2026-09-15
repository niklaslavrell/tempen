import * as types from "../types";

type ParameterData = {
  air_temperature?: number;
};

type TimeSerie = {
  time: string;
  data: ParameterData;
};

type SmhiResponse = {
  createdTime: string;
  referenceTime: string;
  geometry: {
    coordinates: [longitude: number, latitude: number];
    type: "Point";
  };
  timeSeries: TimeSerie[];
};

const FORECAST_BASE_URL = `https://opendata-download-metfcst.smhi.se` as const;

const getForecastUrl = (latitude: number, longitude: number): URL => {
  const url = new URL(FORECAST_BASE_URL);
  url.pathname = `/api/category/snow1g/version/1/geotype/point/lon/${longitude}/lat/${latitude}/data.json`;
  return url;
};

const MESAN_BASE_URL = `https://opendata-download-metanalys.smhi.se` as const;

const getMesanUrl = (latitude: number, longitude: number): URL => {
  const url = new URL(MESAN_BASE_URL);
  url.pathname = `/api/category/mesan2g/version/2/geotype/point/lon/${longitude}/lat/${latitude}/data.json`;
  return url;
};

const parseCoordinate = (coordinate: number): number => {
  return Number(coordinate.toFixed(4));
};

const getAirTemperature = (timeSerie: TimeSerie): number | undefined => {
  return timeSerie.data.air_temperature;
};

const fetchSmhiData = async (url: URL): Promise<SmhiResponse> => {
  const response = await window.fetch(url);
  if (!response.ok) {
    throw new Error(`SMHI responded ${response.status} for ${url.pathname}`);
  }
  return response.json();
};

/**
 * Fetch data from SMHI Open Data Meteorological Forecasts
 * https://opendata.smhi.se/apidocs/metfcst/index.html
 */
const fetchForecastData = async (
  latitude: number,
  longitude: number
): Promise<SmhiResponse> => {
  const parsedLatitude = parseCoordinate(latitude);
  const parsedLongitude = parseCoordinate(longitude);

  return fetchSmhiData(getForecastUrl(parsedLatitude, parsedLongitude));
};

/**
 * Fetch data from SMHI Open Data Meteorological Analysis MESAN
 * https://opendata.smhi.se/apidocs/metanalys/index.html
 */
const fetchAnalysisData = async (
  latitude: number,
  longitude: number
): Promise<SmhiResponse> => {
  const parsedLatitude = parseCoordinate(latitude);
  const parsedLongitude = parseCoordinate(longitude);

  return fetchSmhiData(getMesanUrl(parsedLatitude, parsedLongitude));
};

export const fetchData = async (
  latitude: number,
  longitude: number
): Promise<types.WeatherData | undefined> => {
  const [forecast, analysis] = await Promise.all([
    fetchForecastData(latitude, longitude),
    fetchAnalysisData(latitude, longitude),
  ]);

  if (!forecast || !analysis) return undefined;

  const todayTimeSerie = forecast.timeSeries.at(0);
  if (!todayTimeSerie) return undefined;

  const todayTemperature = getAirTemperature(todayTimeSerie);
  if (todayTemperature === undefined) return undefined;

  const yesterdayTimeSerie = analysis.timeSeries.find(
    (timeSerie) =>
      new Date(timeSerie.time).getHours() ===
      new Date(todayTimeSerie.time).getHours()
  );
  if (!yesterdayTimeSerie) return undefined;

  const yesterdayTemperature = getAirTemperature(yesterdayTimeSerie);
  if (yesterdayTemperature === undefined) return undefined;

  const weatherData: types.WeatherData = {
    today: { celsius: todayTemperature },
    yesterday: { celsius: yesterdayTemperature },
    difference: Math.round(todayTemperature - yesterdayTemperature),
    date: new Date(todayTimeSerie.time),
  };

  return weatherData;
};
