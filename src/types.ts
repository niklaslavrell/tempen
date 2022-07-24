export const enum FetchState {
  loading,
  succeeded,
  failed,
}

export type GeolocationStatus =
  | { status: FetchState.loading }
  | {
      status: FetchState.succeeded;
      geolocationCoordinates: GeolocationCoordinates;
    }
  | {
      status: FetchState.failed;
      geolocationPositionError: GeolocationPositionError;
    };

export type Weather = { celsius: number };

export type WeatherData = {
  today: Weather;
  yesterday: Weather;
  difference: number;
  date: Date;
};

export type WeatherStatus =
  | { status: FetchState.loading }
  | { status: FetchState.succeeded; data: WeatherData }
  | { status: FetchState.failed };
