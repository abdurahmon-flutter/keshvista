import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom'; 
import './style.css';
import 'boxicons/css/boxicons.min.css';
import Dashboard from './contents/Dashboard'; // Import the Dashboard component

const CEO = () => {
  const location = useLocation(); // Hook to get the current path
  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const [isSearchShown, setIsSearchShown] = useState(false);
  const [theme, setTheme] = useState('light');
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard'); 

  // Automatically set the active menu item based on the current path
  useEffect(() => {
    const path = location.pathname.replace('/', ''); 
    setActiveMenuItem(path || 'dashboard'); // Set active menu based on path
    if(path.includes("chats")){
      setActiveMenuItem("chats");
    }
  }, [location]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.add(savedTheme);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarClosed(window.innerWidth < 768);
      setIsSearchShown(window.innerWidth <= 576 ? isSearchShown : false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSearchShown]);

  const toggleSidebar = () => setIsSidebarClosed(!isSidebarClosed);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className={`container ${theme}`}>
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarClosed ? 'close' : ''}`}>
        <a href="/" className="logo">
          <i className='bx bx-spa'></i>
          <div className="logo-name"><span>Kesh</span>Vista</div>
        </a>
        <ul className="side-menu">
          <li 
            className={activeMenuItem === 'dashboard' ? 'active' : ''}>
            <Link to="/" onClick={() => setActiveMenuItem('dashboard')}>
              <i className='bx bxs-dashboard'></i>Bosh Sahifa
            </Link>
          </li>
          <li 
            className={activeMenuItem === 'chats' ? 'active' : ''}>
            <Link to="/chats" onClick={() => setActiveMenuItem('chats')}>
              <i className='bx bx-message-square-dots'></i>Chats
            </Link>
          </li>
        </ul>
        <ul className="side-menu">
          <li>
            <a href="#" className="logout">
              <i className='bx bx-log-out-circle'></i> Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <nav>
          <i className='bx bx-menu' onClick={toggleSidebar}></i>
          <div className="level"><h1>CEO</h1></div>
          <input type="checkbox" id="theme-toggle" hidden onChange={handleThemeToggle} />
          <label htmlFor="theme-toggle" className="theme-toggle"></label>
          <a href="#" className="profile">
            <i className='bx bx-user-circle'></i>
          </a>
        </nav>

        {/* Conditional Rendering: Show Dashboard or Outlet */}
        {activeMenuItem === 'dashboard' ? <Dashboard /> : <Outlet />}
      </div>
    </div>
  );
};

export default CEO;
