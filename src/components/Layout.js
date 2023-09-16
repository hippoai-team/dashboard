// Layout.js
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            {children}
            <Footer />
        </div>
    );
};

export default Layout;
