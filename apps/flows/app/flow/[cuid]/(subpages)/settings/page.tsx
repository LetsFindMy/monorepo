import type { Metadata } from 'next';
import { FlowSettings } from './UI';
import { Container } from '@mantine/core';
import { PageFrame } from '@repo/uix';

interface PageProps {
  params: Promise<{
    cuid: string;
    domain: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Flow Settings | Flowbuilder',
};

const SettingsPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { cuid, domain } = await params;

  return (
    <Container size="lg">
      <PageFrame title="Flow Settings">
        <FlowSettings cuid={cuid} domain={domain} />
      </PageFrame>
    </Container>
  );
};

export default SettingsPage;
