import React from "react";

import styled from "styled-components";

interface InputProps {
  placeholder: string;
  className?: string;
  Icon?: React.ReactElement;
}

export const Input = ({
  Icon,
  placeholder,
  className,
  ...rest
}: InputProps) => (
  <Container className={className}>
    <SearchInput placeholder={placeholder} {...rest} />

    {Icon && <IconWrapper>{Icon}</IconWrapper>}
  </Container>
);

const Container = styled.div`
  position: relative;
  height: 32px;
  display: flex;
  background: ${({ theme }) => theme.palette.blue2};
  border-radius: 4px;
  overflow: hidden;
`;

const SearchInput = styled.input`
  width: calc(100% - 24px);
  padding: 9px 8px 9px 10px;

  background: inherit;
  color: ${({ theme }) => theme.palette.gray4};
  font-weight: 400;
  font-size: 14px;
  line-height: 14px;
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }
`;
