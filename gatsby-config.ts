import type { GatsbyConfig } from "gatsby";

const title = `Tempen` as const;
const description = `Temperaturen idag jämfört med igår` as const;

const config: GatsbyConfig = {
  siteMetadata: {
    title,
    description,
    siteUrl: `https://www.tempen.se`,
  },
  graphqlTypegen: true,
  plugins: [
    `gatsby-plugin-emotion`,
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-netlify`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: title,
        short_name: title,
        description,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#ffd2d2`,
        display: `minimal-ui`,
        icon: `src/images/icon.svg`,
      },
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: ["G-M1SYRP3RGX"],
        gtagConfig: { anonymize_ip: true },
        pluginConfig: { respectDNT: true },
      },
    },
  ],
};

export default config;
