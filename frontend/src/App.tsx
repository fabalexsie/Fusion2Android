import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css';
import { RootPage } from './RootPage';
import { ProjectPage, loader as projectLoader } from './ProjectPage';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootPage></RootPage>,
    children: [
      {
        path: ':projectId',
        element: <ProjectPage></ProjectPage>,
        loader: projectLoader,
      },
    ],
  },
]);

function App() {
  return (
    <MantineProvider>
      <Notifications></Notifications>
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App;
