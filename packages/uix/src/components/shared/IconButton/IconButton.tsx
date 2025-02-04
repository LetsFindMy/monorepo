import type React from 'react';
import { Button, type ButtonProps, Stack, Box } from '@mantine/core';
import styles from './IconButton.module.scss';

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const IconButton = ({ icon, children, ...props }: IconButtonProps) => {
  return (
    <Button classNames={{ root: styles.iconButton }} {...props}>
      <Stack align="center" justify="center" gap={4}>
        <Box className={styles.icon}>{icon}</Box>
        {children}
      </Stack>
    </Button>
  );
};
