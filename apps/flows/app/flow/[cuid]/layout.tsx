// layout.tsx

import { sanitizeFormName } from '#/lib';
import { getFlowAction } from '#/lib/prisma';
import { FlowProvider } from './FlowProvider';

interface FlowLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    cuid: string;
  }>;
}

export default async function FlowLayout({
  children,
  params,
}: FlowLayoutProps) {
  // Await the params since they're now a Promise
  const { cuid } = await params;

  const flowData = await getFlowAction(cuid);
  console.log('🔍 Flow Data:', JSON.stringify(flowData, null, 2));

  const sanitizedCuid = sanitizeFormName(cuid);
  if (!sanitizedCuid) {
    throw new Error('Invalid CUID after sanitization');
  }

  const formOptions = {
    mode: 'uncontrolled' as const,
    name: `flow-${sanitizedCuid}`,
  };

  return (
    <FlowProvider
      formOptions={formOptions}
      nextParams={await params} // Pass the resolved params
      prismaData={flowData}
      error={null}
    >
      {children}
    </FlowProvider>
  );
}
