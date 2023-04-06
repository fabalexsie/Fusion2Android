import {
  AppShell,
  Burger,
  Header,
  Image,
  MediaQuery,
  Navbar,
  Text,
} from '@mantine/core';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export function RootPage() {
  const [opened, setOpened] = useState(false);
  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hidden={!opened}
          hiddenBreakpoint="sm"
          width={{ sm: 200, lg: 300 }}
        >
          <Navbar.Section>
            <Text size="md">Last visited projects</Text>
          </Navbar.Section>
          <Navbar.Section grow mt="md">
            {/* Links sections */}
          </Navbar.Section>
          <Navbar.Section>{/* Footer with user */}</Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={{ base: 50, md: 70 }} p="md">
          <div
            style={{ display: 'flex', alignItems: 'center', height: '100%' }}
          >
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                mr="xl"
              />
            </MediaQuery>
            <Image
              src={'favicon.svg'}
              height={'30px'}
              width={'30px'}
              mr="md"
              fit="contain"
            />
            <Text>Fusion2Android</Text>
          </div>
        </Header>
      }
    >
      <Outlet></Outlet>
    </AppShell>
  );
}
