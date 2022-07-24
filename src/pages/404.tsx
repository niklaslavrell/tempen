import React from "react";
import { Link } from "gatsby";
import { Layout } from "../components/layout";

const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <title>404</title>
      <h1>Kunde inte hitta sidan</h1>
      <Link to="/">Tillbaka</Link>
    </Layout>
  );
};

export default NotFoundPage;
