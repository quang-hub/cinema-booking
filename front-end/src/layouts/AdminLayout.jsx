// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import Sidebar from '../scenes/global/Sidebar';
import Topbar from '../scenes/global/Topbar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isSidebar={isSidebar} />
      <main className="flex-grow ml-30 p-4 overflow-y-auto"> {/* Đẩy nội dung sang phải */}
        <Topbar setIsSidebar={setIsSidebar} />
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
