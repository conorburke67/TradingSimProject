import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/TopBar.css';

function TopBar() {
    return (
        <nav className="top-bar">
            <NavLink to="/" className="nav-link" activeClassName="active-link">
                Home
            </NavLink>
            <NavLink to="/portfolio" className="nav-link" activeClassName="active-link">
                My Portfolio
            </NavLink>
            <NavLink to="/market" className="nav-link" activeClassName="active-link">
                Market
            </NavLink>
        </nav>
    );
}
export default TopBar;