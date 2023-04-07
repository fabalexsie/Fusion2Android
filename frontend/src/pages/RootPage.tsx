import {
  AppShell,
  Burger,
  Header,
  Image,
  MediaQuery,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { NavMenu } from './NavMenu';

export function RootPage() {
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
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
            <Link
              to="/"
              className="only-link-to"
              style={{ display: 'flex', alignItems: 'center', height: '100%' }}
            >
              <Image
                src={'/favicon.svg'}
                height={'34px'}
                width={'34px'}
                fit="contain"
              />
              <Title order={1}>usion2Android</Title>
            </Link>
          </div>
        </Header>
      }
      navbarOffsetBreakpoint="sm"
      navbar={<NavMenu opened={opened} />}
    >
      <Outlet></Outlet>
    </AppShell>
  );
}
