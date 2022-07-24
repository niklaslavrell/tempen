import React from "react";
import { useSiteMetadata } from "../hooks/use-site-metadata";

export const SEO: React.FC = () => {
  const siteMetadata = useSiteMetadata();

  return (
    <>
      {siteMetadata.title && <title>{siteMetadata.title}</title>}
      {siteMetadata.description && (
        <meta name="description" content={siteMetadata.description} />
      )}
      {siteMetadata.title && (
        <meta name="twitter:title" content={siteMetadata.title} />
      )}
      {siteMetadata.siteUrl && (
        <meta name="twitter:url" content={siteMetadata.siteUrl} />
      )}
      {siteMetadata.description && (
        <meta name="twitter:description" content={siteMetadata.description} />
      )}
    </>
  );
};
