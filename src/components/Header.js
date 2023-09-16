import React, { Component } from "react";
import { useAuth } from "../context/auth";
import { toast } from "react-toastify";

const Header = () => {
  const [auth, setAuth] = useAuth();

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
      isAuthenticated: false
    });
    localStorage.removeItem("auth");
    toast.success("Logout successfully");
  };

  return (
    <div>
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        {/* Left navbar links */}
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" data-widget="pushmenu" href="#">
              <i className="fas fa-bars" />
            </a>
          </li>
          <li class="nav-item d-none d-sm-inline-block">
            <a href="/dashboard" class="nav-link">
              Dashboard
            </a>
          </li>

          <li class="nav-item d-none d-sm-inline-block">
            <a href="/login" onClick={handleLogout} class="nav-link">
              Logout
            </a>
          </li>
        </ul>
        {/* Right navbar links */}
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <a
              className="nav-link"
              data-widget="control-sidebar"
              data-slide="true"
              href="#"
            >
              <i className="fas fa-th-large" />
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
