import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';

export function RootPage() {
  return (
    <AppShell navbar={<>Root Navigation</>}>
      <Outlet></Outlet>
    </AppShell>
  );
}
