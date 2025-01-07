import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden border-none">
      <div className="w-full h-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
