import React, { useCallback, useEffect, useState } from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  AnimateFade,
  AnimateY,
  BoldText,
  Button,
  LightText,
  RegularText,
  TemperatureText,
  TemperatureWrapper,
} from "../atoms";
import * as types from "../types";
import * as utils from "../utils";
import * as smhi from "../apis/smhi";
import { Layout } from "../components/layout";
import { SEO } from "../components/seo";
import { usePersistedState } from "../hooks/use-persisted-state";
import * as Arrows from "../images/arrows";
import { useSiteMetadata } from "../hooks/use-site-metadata";

const Grid = styled.div`
  height: 100%;
  max-height: 40rem;
  width: 100%;
  max-width: 20rem;
  padding: 0.5rem;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 25% 25% 25% 25%;
`;

const GridItem = styled.div`
  place-self: center;
`;

const IndexPage: React.FC = () => {
  const [locationPermissionState, setLocationPermissionState] =
    useState<PermissionState>();
  const [location, setLocation] = useState<types.GeolocationStatus>();
  const [lastFetchedLocationAt, setLastFetchedLocationAt] = usePersistedState(
    "last-fetched-location-at"
  );
  const [weatherStatus, setWeatherStatus] = useState<types.WeatherStatus>();

  const siteMetadata = useSiteMetadata();

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

  const fetchWeatherData = async (
    geolocationCoordinates: GeolocationCoordinates
  ) => {
    setWeatherStatus({ status: types.FetchState.loading });
    const data = await smhi.fetchData(
      geolocationCoordinates.latitude,
      geolocationCoordinates.longitude
    );
    if (data) {
      setWeatherStatus({ status: types.FetchState.succeeded, data });
    } else {
      setWeatherStatus({ status: types.FetchState.failed });
    }
  };

  const onClickFetchLocation = () => {
    fetchLocation();
  };

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    if (utils.hasPermissionsApi && locationPermissionState === "granted") {
      fetchLocation();
    }
  }, [locationPermissionState, fetchLocation]);

  useEffect(() => {
    if (!utils.hasPermissionsApi && !location) {
      const now = new Date().getTime();
      const then = Number(lastFetchedLocationAt);
      if (now - then <= utils.A_DAY_IN_MS) {
        fetchLocation();
      }
    }
  }, [location, lastFetchedLocationAt, fetchLocation]);

  useEffect(() => {
    if (location?.status === types.FetchState.succeeded) {
      fetchWeatherData(location.geolocationCoordinates);
    }
  }, [location]);

  return (
    <Layout>
      <Grid>
        <GridItem>
          <AnimateFade>
            <RegularText>{siteMetadata.description}</RegularText>
          </AnimateFade>

          {weatherStatus?.status === types.FetchState.succeeded && (
            <AnimateFade>
              <RegularText>{`kl ${utils.getHoursTwoDigit(
                weatherStatus.data.date
              )}`}</RegularText>
            </AnimateFade>
          )}
        </GridItem>

        <GridItem>
          {!location && locationPermissionState !== "denied" && (
            <AnimateFade>
              <BoldText>
                Ange din plats för att visa temperaturskillnader
              </BoldText>
            </AnimateFade>
          )}

          {(location?.status === types.FetchState.failed ||
            locationPermissionState === "denied") && (
            <AnimateFade>
              <LightText>Kunde inte hämta koordinater</LightText>
            </AnimateFade>
          )}

          {location?.status === types.FetchState.loading && (
            <AnimateFade>
              <LightText>Hämtar koordinater</LightText>
            </AnimateFade>
          )}

          {weatherStatus?.status === types.FetchState.loading && (
            <AnimateFade>
              <LightText>Hämtar väder</LightText>
            </AnimateFade>
          )}

          {weatherStatus?.status === types.FetchState.succeeded && (
            <AnimateFade>
              <TemperatureWrapper>
                {weatherStatus.data.difference > 0 && (
                  <AnimateY direction="up">
                    <Arrows.Warmer />
                  </AnimateY>
                )}
                {weatherStatus.data.difference < 0 && (
                  <AnimateY direction="down">
                    <Arrows.Colder />
                  </AnimateY>
                )}
                <TemperatureText large>
                  {weatherStatus.data.difference >= 0
                    ? weatherStatus.data.difference
                    : weatherStatus.data.difference * -1}
                </TemperatureText>
                <TemperatureText>°C</TemperatureText>
              </TemperatureWrapper>
            </AnimateFade>
          )}
        </GridItem>

        <GridItem>
          {((!location && locationPermissionState !== "denied") ||
            (location?.status !== types.FetchState.loading &&
              locationPermissionState === "prompt")) && (
            <AnimateFade>
              <Button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  rotate: [0, 5, -5, 5, -5, 0],
                  transition: {
                    type: "spring",
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 5,
                    delay: 3,
                  },
                }}
                onClick={() => onClickFetchLocation()}
              >
                Hämta min plats
              </Button>
            </AnimateFade>
          )}

          {weatherStatus?.status === types.FetchState.succeeded && (
            <AnimateFade>
              <LightText>Där du är just nu</LightText>
              <RegularText
                css={css`
                  font-size: 1.5rem;
                `}
              >{`${weatherStatus.data?.today.celsius.toFixed(
                0
              )} °C`}</RegularText>
            </AnimateFade>
          )}
        </GridItem>
        <GridItem>
          {weatherStatus?.status === types.FetchState.succeeded && (
            <AnimateFade>
              <LightText
                css={css`
                  padding: 0 1rem;
                `}
              >
                {weatherStatus.data.difference > 0
                  ? `Det är ${weatherStatus.data.difference} grader varmare idag än igår vid den här tiden`
                  : weatherStatus.data.difference < 0
                  ? `Det är ${
                      weatherStatus.data.difference * -1
                    } grader kallare idag än igår vid den här tiden`
                  : `Det är lika varmt idag som igår vid den här tiden`}
              </LightText>
            </AnimateFade>
          )}
        </GridItem>
      </Grid>
    </Layout>
  );
};

export default IndexPage;

export const Head = () => <SEO />;
