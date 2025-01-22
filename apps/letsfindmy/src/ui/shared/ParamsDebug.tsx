import { Code, Container } from '@mantine/core';

export const ParamsDebug = (params: any) => {
  return (
    <Container>
      <Code block>{JSON.stringify(params, null, 2)}</Code>
    </Container>
  );
};
