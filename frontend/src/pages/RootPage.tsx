import {
  AppShell,
  Burger,
  Header,
  Image,
  MediaQuery,
  Navbar,
  Title,
  createStyles,
  rem,
} from '@mantine/core';
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { getLastOpenedProjects } from '../util/localStorageUtil';

const useStyles = createStyles((theme) => ({
  link: {
    boxSizing: 'border-box',
    display: 'block',
    textDecoration: 'none',
    borderTopRightRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    padding: `0 ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    marginRight: theme.spacing.md,
    fontWeight: 500,
    height: rem(44),
    lineHeight: rem(44),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    },
  },

  linkActive: {
    '&, &:hover': {
      borderLeftColor: theme.fn.variant({
        variant: 'filled',
        color: theme.primaryColor,
      }).background,
      backgroundColor: theme.fn.variant({
        variant: 'filled',
        color: theme.primaryColor,
      }).background,
      color: theme.white,
    },
  },
}));

export function RootPage() {
  const { classes, cx } = useStyles();
  const { pathname } = useLocation();

  const [opened, setOpened] = useState(false);

  const lastOpenedProjects = getLastOpenedProjects();

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
      navbar={
        <Navbar
          p="md"
          hidden={!opened}
          hiddenBreakpoint="sm"
          width={{ sm: 200, lg: 300 }}
        >
          <Navbar.Section>
            <Title order={4}>Last visited projects</Title>
          </Navbar.Section>
          <Navbar.Section grow mt="md">
            {lastOpenedProjects.map((proj, i) => (
              <Link
                key={proj.projectId}
                to={`/${proj.projectId}`}
                className={cx(classes.link, {
                  [classes.linkActive]: `/${proj.projectId}` === pathname,
                })}
              >
                Project {proj.name}
              </Link>
            ))}
            {/* Links sections */}
          </Navbar.Section>
          <Navbar.Section>{/* Footer with user */}</Navbar.Section>
        </Navbar>
      }
    >
      <Outlet></Outlet>
    </AppShell>
  );
}
