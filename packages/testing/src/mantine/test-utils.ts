import userEvent from '@testing-library/user-event';
import { render } from '../utils/render';
import { screen, within } from '@testing-library/react';

export const createMantineTest = () => {
  const user = userEvent.setup();

  return {
    user,
    render,
    screen,
    within,
  };
};
