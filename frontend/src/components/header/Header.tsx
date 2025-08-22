import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../../contexts/AppContext';
import { useAdminContext } from '../../contexts/AdminContext';
import { useEffect, useState } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import '../../index.css';
import LogoutButton from './LogoutButton';
import * as apiClient from '../../api-client';

const Header = () => {
  const { isLoggedIn } = useAppContext();
  const { isAdminLoggedIn } = useAdminContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: user } = useQuery({
    queryKey: ["loadAccount"],
    queryFn: apiClient.loadAccount
  });

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => { }, [user]);
  const activeClassNameProp = { activeClassName: "active-link" };

  const { mode, toggleMode } = useThemeContext();
  return (
    <div className={mode === 'dark' ? 'bg-gray-900 py-4 top-0 z-50' : 'bg-gray-200 py-4 top-0 z-50'}>
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <Link to="/search" className="text-3xl font-bold tracking-tight mb-4 md:mb-0">
          <img src="/logonobg2.png" style={{ height: "35px" }} alt="" />
          {isAdminLoggedIn && <span className='text-sm flex'><Link to="/admin/dashboard" >ADMIN</Link></span>}
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
          {isAdminLoggedIn ? (
            <>
              <div className="relative mb-4 md:mb-0">
                <h3 className="px-4 py-2 cursor-pointer text-black font-semibold hover:bg-gray-100" onClick={handleDropdownToggle}>
                  Dashboard
                  <button className="w-3 h-7 ml-1 py-2">
                    <img src="/drop-down-arrow2.png" alt="Toggle filter visibility" />
                  </button>
                </h3>
                {isDropdownOpen && (
                  <div className="absolute top-12 md:top-auto right-0 z-10 bg-white border border-gray-200 rounded shadow-md">
                    <ul onClick={() => setIsDropdownOpen(false)}>
                      <li className="px-4 py-2 hover:bg-gray-100"><NavLink to="/admin/dashboard" {...activeClassNameProp}>Dashboard</NavLink></li>
                      <li className="px-4 py-2 hover:bg-gray-100"><NavLink to="/admin/bookings" {...activeClassNameProp}>Bookings</NavLink></li>
                      <li className="px-4 py-2 hover:bg-gray-100"><NavLink to="/admin/hotels" {...activeClassNameProp}>Hotels</NavLink></li>
                      <li className="px-4 py-2 hover:bg-gray-100"><NavLink to="/admin/restaurants" {...activeClassNameProp}>Restaurants</NavLink></li>
                      <li className="px-4 py-2 hover:bg-gray-100"><NavLink to="/admin/users" {...activeClassNameProp}>Users</NavLink></li>
                    </ul>
                  </div>
                )}
              </div>
              <NavLink className='px-4 py-2 cursor-pointer text-black font-semibold hover:bg-gray-100' to="/admin/chat" {...activeClassNameProp}>Chat</NavLink>
            </>
          ) : (
            <>
              {!isLoggedIn ? (
                <Link to="/login" className="px-4 py-2 cursor-pointer text-black font-semibold hover:bg-gray-100">Login</Link>
              ) : (
                <div className="flex mb-4 md:mb-0">
                  <h5 className="px-4 py-2 hover:bg-gray-100 font-semibold"><Link to="/home/account">Profile</Link></h5>
                  <h5 className="px-4 py-2 hover:bg-gray-100 font-semibold"><Link to="/home/bookings">Bookings</Link></h5>
                  <h5 className="px-4 py-2 hover:bg-gray-100 font-semibold"><Link to="/home/help">Help</Link></h5>
                </div>
              )}
            </>
          )}
          {(isLoggedIn || isAdminLoggedIn) && <LogoutButton isAdmin={isAdminLoggedIn} />}
          {/* Dark mode toggle button */}
          <ThemeToggle mode={mode} toggleMode={toggleMode} />
        </div>
      </div>
    </div>
  );
}

const ThemeToggle = ({ mode, toggleMode }: { mode: 'light' | 'dark'; toggleMode: () => void }) => (
  <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
    <IconButton onClick={toggleMode} color="inherit">
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  </Tooltip>
);


export default Header;
