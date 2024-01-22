import * as types from "../types";

type Parameter = AirPressure | AirTemperature;

type AirPressure = {
  name: "msl";
  unit: "hPa";
  levelType: "hmsl";
  level: 0;
  values: number[];
};

type AirTemperature = {
  name: "t";
  unit: "C";
  levelType: "	hl";
  level: 2;
  values: number[];
};

type TimeSerie = {
  parameters: Parameter[];
  validTime: string;
};

type SmhiResponse = {
  approvedTime: string;
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
  url.pathname = `/api/category/pmp3g/version/2/geotype/point/lon/${longitude}/lat/${latitude}/data.json`;
  return url;
};

const MESAN_BASE_URL = `https://opendata-download-metanalys.smhi.se` as const;

const getMesanUrl = (latitude: number, longitude: number): URL => {
  const url = new URL(MESAN_BASE_URL);
  url.pathname = `/api/category/mesan1g/version/2/geotype/point/lon/${longitude}/lat/${latitude}/data.json`;
  return url;
};

const parseCoordinate = (coordinate: number): number => {
  return Number(coordinate.toFixed(4));
};

const getAirTemperatureParameter = (
  timeSerie: TimeSerie
): AirTemperature | undefined => {
  for (const parameter of timeSerie.parameters) {
    if (parameter.name === "t") {
      return parameter;
    }
  }
  return undefined;
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

  const url = getForecastUrl(parsedLatitude, parsedLongitude);

  const response = await window.fetch(url);
  const smhiResponse: SmhiResponse = await response.json();

  return smhiResponse;
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

  const url = getMesanUrl(parsedLatitude, parsedLongitude);

  const response = await window.fetch(url);
  const smhiResponse: SmhiResponse = await response.json();

  return smhiResponse;
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

  const todayTemperature =
    getAirTemperatureParameter(todayTimeSerie)?.values.at(0);
  if (!todayTemperature) return undefined;

  const yesterdayTimeSerie = analysis.timeSeries.find(
    (timeSerie) =>
      new Date(timeSerie.validTime).getHours() ===
      new Date(todayTimeSerie.validTime).getHours()
  );
  if (!yesterdayTimeSerie) return undefined;

  const yesterdayTemperature =
    getAirTemperatureParameter(yesterdayTimeSerie)?.values.at(0);
  if (!yesterdayTemperature) return undefined;

  const weatherData: types.WeatherData = {
    today: { celsius: todayTemperature },
    yesterday: { celsius: yesterdayTemperature },
    difference: Math.round(todayTemperature - yesterdayTemperature),
    date: new Date(todayTimeSerie.validTime),
  };

  return weatherData;
};
