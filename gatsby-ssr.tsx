import React from "react";
import { RootElement } from "./src/components/root-element";

export const onRenderBody = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: "sv" });
};

export const wrapRootElement = ({ element }) => {
  return <RootElement>{element}</RootElement>;
};
