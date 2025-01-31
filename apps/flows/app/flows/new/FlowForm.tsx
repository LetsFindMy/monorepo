'use client';

import { useMemo } from 'react';
import { useForm, type UseFormReturnType } from '@mantine/form';
import {
  Button,
  Paper,
  Stack,
  Text,
  TextInput,
  Container,
} from '@mantine/core';
import {
  IconArrowRight,
  IconNumber123,
  IconTelescope,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { FlowMethod, createFlowAction } from '#/lib/prisma';
import { motion } from 'framer-motion';
import { PageFrame } from '@repo/uix';
import { isolateSubdomain } from '#/lib/utils';
import { ImageRadios } from '#/ui/formFields';
import { useDisclosure } from '@mantine/hooks';

interface NewFlowFormProps {
  params: {
    domain: string;
  };
}

interface FlowFormValues {
  flowName: string;
  flowMethod: FlowMethod;
  authorId: string;
  flowData: string;
}

export const NewFlowForm: React.FC<NewFlowFormProps> = ({ params }) => {
  const router = useRouter();

  const subdomain = useMemo(
    () => isolateSubdomain(params?.domain),
    [params?.domain],
  );

  const [loading, { open: startLoading, close: stopLoading }] =
    useDisclosure(false);

  // @ts-ignore TODO: Fix this
  const form: UseFormReturnType<FlowFormValues> = useForm({
    mode: 'uncontrolled',
    initialValues: {
      flowName: '',
      flowMethod: FlowMethod.observable,
      authorId: '1',
      flowData: '',
    },
    validate: {
      flowName: (value) =>
        value.trim().length < 2
          ? 'Flow name must have at least 2 characters'
          : null,
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const flowMethods = useMemo(
    () => [
      {
        value: FlowMethod.observable,
        label: 'Observable',
        icon: IconTelescope,
        helperText: 'Dynamic: Responds to events.',
      },
      {
        value: FlowMethod.sequential,
        label: 'Sequential',
        icon: IconNumber123,
        helperText: 'Fixed: Runs steps in order.',
      },
    ],
    [],
  );

  const handleSubmit = async (values: FlowFormValues) => {
    if (!form.isValid()) return;

    startLoading();

    try {
      const payload = { ...values, subdomain };
      const newFlow = await createFlowAction(payload);
      if (newFlow) {
        form.reset();
        router.push(`/flow/${newFlow.id}`);
      } else {
        form.setErrors({ flowName: 'Failed to create flow' });
      }
    } catch {
      form.setErrors({ flowName: 'Error creating flow, try again later' });
    } finally {
      stopLoading();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const [opened, { toggle }] = useDisclosure(false);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <PageFrame
        title={
          <>
            Create your new{' '}
            <Text
              component="span"
              fw={600}
              variant="gradient"
              gradient={{ from: 'cyan', to: 'indigo.3' }}
              inherit
            >
              flow
            </Text>
          </>
        }
      >
        <Container size="sm">
          <Paper shadow="sm" p="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                <motion.div variants={itemVariants}>
                  <TextInput
                    label="Flow Name"
                    placeholder="Enter flow name"
                    {...form.getInputProps('flowName')}
                    error={form.errors.flowName}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <ImageRadios items={flowMethods as any} form={form} />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    rightSection={
                      !loading ? <IconArrowRight size={16} /> : null
                    }
                    disabled={
                      !form.isTouched('flowName') ||
                      form.errors.flowName !== undefined ||
                      loading
                    }
                    loading={loading}
                    variant="gradient"
                    gradient={{ from: 'teal', to: 'blue' }}
                    size="md"
                    radius="md"
                    w="100%"
                    styles={{
                      root: {
                        transition:
                          'transform 0.2s ease, background-color 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          backgroundImage: 'linear-gradient(90deg, teal, blue)',
                        },
                        '&:active': {
                          transform: 'scale(0.95)',
                        },
                      },
                    }}
                  >
                    Create Flow
                  </Button>
                </motion.div>
              </Stack>
            </form>
          </Paper>
        </Container>
      </PageFrame>
    </motion.div>
  );
};
