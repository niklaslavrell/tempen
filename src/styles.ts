import { css } from "@emotion/react";

export const global = css`
  html,
  body,
  #___gatsby,
  #gatsby-focus-wrapper {
    height: 100%;
  }
  body {
    margin: 0;
    background: linear-gradient(180deg, #ffd2d2 0%, #ddebff 100%);
    font-family: "Work Sans", sans-serif;
  }
  p {
    margin: 0.5rem 0;
  }
`;
