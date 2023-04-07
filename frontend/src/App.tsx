import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css';
import { RootPage } from './pages/RootPage';
import {
  ProjectPage,
  loader as projectLoader,
  action as projectAction,
} from './pages/ProjectPage';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Welcome } from './pages/Welcome';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootPage></RootPage>,
    children: [
      {
        path: '',
        element: <Welcome />,
      },
      {
        path: ':projectId',
        element: <ProjectPage></ProjectPage>,
        loader: projectLoader,
        action: projectAction,
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
