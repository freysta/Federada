import { Outlet } from 'react-router-dom';
import ChampionshipNavbar from '../components/championships/ChampionshipNavbar';

export default function ChampionshipLayout() {
  return (
    <>
      <ChampionshipNavbar />
      <div className="pt-20 min-h-screen bg-black text-white selection:bg-[#00f0ff] selection:text-black">
        <Outlet />
      </div>
    </>
  );
}
