import { Box, Center } from '@mantine/core';
import { SearchIcon } from '#/ui/SearchIcon';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LetsFindMy',
  description: "Find your fandom's merch.",
};

export default function Page() {
  return (
    <Center w="100vw" h="100vh" style={{ backgroundColor: '#625D9B' }}>
      <SearchIcon size={248} />
    </Center>
  );
}
