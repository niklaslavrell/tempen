import { useCallback, useEffect, useState } from "react";
import * as types from "../types";
import * as utils from "../utils";
import { usePersistedState } from "./use-persisted-state";

export const useLocation = () => {
  const [locationPermissionState, setLocationPermissionState] =
    useState<PermissionState>();
  const [location, setLocation] = useState<types.GeolocationStatus>();
  const [lastFetchedLocationAt, setLastFetchedLocationAt] = usePersistedState(
    "last-fetched-location-at"
  );

  const onPermissionStatusChange = (event: Event) => {
    if (event.target) {
      const permissionStatus = event.target as PermissionStatus;
      setLocationPermissionState(permissionStatus.state);
    }
  };

  const checkPermission = useCallback(async () => {
    if (!utils.hasPermissionsApi) return;
    const permissionStatus = await navigator.permissions.query({
      name: "geolocation",
    });
    setLocationPermissionState(permissionStatus.state);
    permissionStatus.onchange = onPermissionStatusChange;
  }, []);

  const fetchLocation = useCallback(() => {
    setLocation({ status: types.FetchState.loading });
    navigator.geolocation.getCurrentPosition(
      (geolocationPosition) => {
        setLocation({
          status: types.FetchState.succeeded,
          geolocationCoordinates: geolocationPosition.coords,
        });
        setLastFetchedLocationAt(new Date().getTime().toString());
      },
      (geolocationPositionError: GeolocationPositionError) => {
        setLocation({
          status: types.FetchState.failed,
          geolocationPositionError,
        });
      }
    );
  }, [setLastFetchedLocationAt]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    if (
      utils.hasPermissionsApi &&
      locationPermissionState === "granted" &&
      !location
    ) {
      fetchLocation();
    }
  }, [location, locationPermissionState, fetchLocation]);

  useEffect(() => {
    if (!utils.hasPermissionsApi && !location) {
      const now = new Date().getTime();
      const then = Number(lastFetchedLocationAt);
      if (now - then <= utils.A_DAY_IN_MS) {
        fetchLocation();
      }
    }
  }, [location, lastFetchedLocationAt, fetchLocation]);

  return {
    location,
    locationPermissionState,
    fetchLocation,
  };
};
