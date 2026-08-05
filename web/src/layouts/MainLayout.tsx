import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <div className="pt-20 min-h-screen bg-slate-50">
        <Outlet />
      </div>
    </>
  );
}
