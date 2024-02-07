import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CreatePage from './pages/Create';
import HomePage from './pages/Home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/create',
    element: <CreatePage />,
  },
]);

function App(): JSX.Element {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
