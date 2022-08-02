import React from "react";
import { motion } from "framer-motion";
import styled from "@emotion/styled";

export const Paragraph = styled.p`
  text-align: center;
`;

export const LightestText = styled(Paragraph)`
  font-weight: 100;
`;

export const LightText = styled(Paragraph)`
  font-weight: 300;
`;

export const RegularText = styled(Paragraph)`
  font-weight: 400;
`;

export const BoldText = styled(Paragraph)`
  font-weight: 500;
`;

export const TemperatureWrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export const TemperatureText = styled(LightestText)<{ large?: boolean }>`
  font-size: ${(props) => (props.large ? "10rem" : "2rem")};
  margin: 0;
`;

export const Link = styled.a`
  color: unset;
`;

export const Button = styled(motion.button)`
  font-family: inherit;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4rem;
  font-size: 1.5rem;
  border: 2px solid black;
  font-weight: 500;
  background-color: transparent;
  color: black;
  cursor: pointer;
`;

export const AnimateFade: React.FC<{ children: React.ReactNode }> = ({
  children,
  ...rest
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    layout
    {...rest}
  >
    {children}
  </motion.div>
);

export const AnimateY: React.FC<{
  children: React.ReactNode;
  direction: "up" | "down";
}> = ({ children, direction, ...rest }) => (
  <motion.div
    initial={{ y: direction === "up" ? 16 : -16 }}
    animate={{ y: 0 }}
    transition={{ duration: 1 }}
    {...rest}
  >
    {children}
  </motion.div>
);
