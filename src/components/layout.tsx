import { Global } from "@emotion/react";
import styled from "@emotion/styled";
import * as styles from "../styles";

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Layout: React.FC<{ children: React.ReactNode }> = (props) => {
  return (
    <Wrapper>
      <Global styles={styles.global} />
      {props.children}
    </Wrapper>
  );
};
