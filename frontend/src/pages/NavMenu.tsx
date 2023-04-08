import { Divider, Navbar, Title, createStyles, rem } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
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

  newProjLink: {
    boxSizing: 'border-box',
    display: 'block',
    textDecoration: 'none',
    borderRadius: theme.radius.md,
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.gray[7]
        : theme.colors.gray[4],
    padding: `0 ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    marginRight: theme.spacing.md,
    fontWeight: 500,
    height: rem(44),
    lineHeight: rem(44),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

export function NavMenu({ opened }: { opened: boolean }) {
  const { classes, cx } = useStyles();
  const { pathname } = useLocation();

  const lastOpenedProjects = getLastOpenedProjects();

  return (
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
      <Divider />
      <Navbar.Section mt="md">
        <Link to={`/newProject`} className={classes.newProjLink}>
          Create new project
        </Link>
      </Navbar.Section>
      <Navbar.Section>{/* Footer with user */}</Navbar.Section>
    </Navbar>
  );
}
