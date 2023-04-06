import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css';
import { RootPage } from './RootPage';
import { ProjectPage, loader as projectLoader } from './ProjectPage';
import { MantineProvider } from '@mantine/core';

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
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App;
