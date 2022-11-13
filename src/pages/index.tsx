import React, { useCallback, useEffect, useState } from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import {
  AnimateFade,
  AnimateY,
  BoldText,
  Button,
  LightestText,
  LightText,
  Link,
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

  const weatherQuery = useQuery(
    [
      "weather",
      location?.status === types.FetchState.succeeded &&
        location.geolocationCoordinates.latitude,
      location?.status === types.FetchState.succeeded &&
        location.geolocationCoordinates.longitude,
    ],
    async () => {
      if (location?.status !== types.FetchState.succeeded)
        throw new Error("No location");
      const weatherData = await smhi.fetchData(
        location.geolocationCoordinates.latitude,
        location.geolocationCoordinates.longitude
      );
      return weatherData;
    },
    { enabled: location?.status === types.FetchState.succeeded }
  );

  return (
    <Layout>
      <Grid>
        <GridItem>
          <AnimateFade>
            <RegularText>{siteMetadata.description}</RegularText>
          </AnimateFade>

          {weatherQuery.data && (
            <AnimateFade>
              <RegularText>{`kl ${utils.getHoursTwoDigit(
                weatherQuery.data.date
              )}`}</RegularText>
            </AnimateFade>
          )}
        </GridItem>

        <GridItem>
          {weatherQuery.data ? (
            <AnimateFade key="temp">
              <TemperatureWrapper>
                {weatherQuery.data.difference > 0 ? (
                  <AnimateY direction="up">
                    <Arrows.Warmer />
                  </AnimateY>
                ) : weatherQuery.data.difference < 0 ? (
                  <AnimateY direction="down">
                    <Arrows.Colder />
                  </AnimateY>
                ) : null}
                <TemperatureText large>
                  {weatherQuery.data.difference >= 0
                    ? weatherQuery.data.difference
                    : weatherQuery.data.difference * -1}
                </TemperatureText>
                <TemperatureText>°C</TemperatureText>
              </TemperatureWrapper>
            </AnimateFade>
          ) : location?.status === types.FetchState.failed ||
            locationPermissionState === "denied" ? (
            <AnimateFade key="location-fail">
              <LightText>Kunde inte hämta koordinater</LightText>
            </AnimateFade>
          ) : location?.status === types.FetchState.loading ? (
            <AnimateFade key="location-load">
              <LightText>Hämtar koordinater</LightText>
            </AnimateFade>
          ) : !location ? (
            <AnimateFade key="location-prompt">
              <BoldText>
                Ange din plats för att visa temperaturskillnader
              </BoldText>
            </AnimateFade>
          ) : weatherQuery.isLoading ? (
            <AnimateFade key="wheather-load">
              <LightText>Hämtar väder</LightText>
            </AnimateFade>
          ) : null}
        </GridItem>

        <GridItem>
          {weatherQuery.data ? (
            <AnimateFade key="wheather-now">
              <LightText>Där du är just nu</LightText>
              <RegularText
                css={css`
                  font-size: 1.5rem;
                `}
              >{`${weatherQuery.data.today.celsius.toFixed(
                0
              )} °C`}</RegularText>
            </AnimateFade>
          ) : (
            ((!location && locationPermissionState !== "denied") ||
              (location?.status !== types.FetchState.loading &&
                locationPermissionState === "prompt")) && (
              <AnimateFade key="location-button">
                <Button
                  onClick={fetchLocation}
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
                >
                  Hämta min plats
                </Button>
              </AnimateFade>
            )
          )}
        </GridItem>

        <GridItem>
          {weatherQuery.data && (
            <AnimateFade>
              <LightText
                css={css`
                  padding: 1rem;
                `}
              >
                {weatherQuery.data.difference > 0
                  ? `Det är ${weatherQuery.data.difference} grader varmare idag än igår vid den här tiden`
                  : weatherQuery.data.difference < 0
                  ? `Det är ${
                      weatherQuery.data.difference * -1
                    } grader kallare idag än igår vid den här tiden`
                  : `Det är lika varmt idag som igår vid den här tiden`}
              </LightText>
              <LightestText>
                Källa: <Link href="https://www.smhi.se/data">SMHI</Link>
              </LightestText>
            </AnimateFade>
          )}
        </GridItem>
      </Grid>
    </Layout>
  );
};

export default IndexPage;

export const Head = () => <SEO />;
