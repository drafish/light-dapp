import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CreatePage from './pages/Create';
import HomePage from './pages/Home';
import RemixHomePage from './pages/Remix/Home';
import RemixCreatePage from './pages/Remix/Create';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/create',
    element: <CreatePage />,
  },
  {
    path: '/remix',
    element: <RemixHomePage />,
  },
  {
    path: '/remix/create',
    element: <RemixCreatePage />,
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
