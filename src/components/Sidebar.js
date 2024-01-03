import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Brand Logo */}
      <a href="/dashboard" className="brand-link">
        <img src="dist/img/AdminLTELogo.png" alt="AdminLTE Logo" className="brand-image img-circle elevation-3" style={{opacity: '.8'}} />
        <span className="brand-text font-weight-light">Admin Panel</span>
      </a>
      {/* Sidebar */}
      <div className="sidebar">
        {/* Sidebar user panel (optional) */}
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
   
          <div className="info">
            <a href="/dashboard" className="d-block">Admin Account</a>
          </div>

        </div>
        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                <i className="nav-icon fas fa-th"></i>
                <p>Dashboard</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/sources" className="nav-link">
                <i className="nav-icon fas fa-book"></i>
                <p>Sources</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/betalist" className="nav-link">
                <i className="nav-icon fas fa-list"></i>
                <p>Beta List</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/chatlog" className="nav-link">
                <i className="nav-icon fas fa-comments"></i>
                <p>Chat Log</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/users" className="nav-link">
                <i className="nav-icon fas fa-users"></i>
                <p>Users</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/apilog" className="nav-link">
                <i className="nav-icon fas fa-list"></i>
                <p>API Usage Log</p>
              </Link>
            </li>
          
          </ul>
        </nav>
        {/* /.sidebar-menu */}
      </div>
      {/* /.sidebar */}
    </aside>
  );
};

export default Sidebar;



