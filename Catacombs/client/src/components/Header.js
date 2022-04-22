import React, { useState, useContext } from 'react';
import { NavLink as RRNavLink } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarText
} from 'reactstrap';
import { UserContext } from './Repositories/UserProvider';
import icon from './Movies/images/icon.png'
import "./Header.css"

export default function Header() {
  const { isLoggedIn, logout } = useContext(UserContext);
  const user = JSON.parse(sessionStorage.getItem("userProfile"))
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <div>
      <Navbar color="dark" dark expand="md">
        <NavbarBrand tag={RRNavLink} to="/">
          <img className="me-3 ms-5" src={icon} alt="icon" width="30" height="30" />
          The Catacombs</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            { /* When isLoggedIn === true, we will render the Home link */}
            {isLoggedIn &&
              <>
                {/* <NavItem>
                  <NavLink tag={RRNavLink} to="/">Home</NavLink>
                </NavItem> */}

                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    Movies
                  </DropdownToggle>
                  <DropdownMenu dark end>
                    <DropdownItem>
                      <NavLink tag={RRNavLink} to="/movies/rating">Top Rated</NavLink>
                    </DropdownItem>
                    <DropdownItem>
                      <NavLink tag={RRNavLink} to="/movies/popular">Most Popular</NavLink>
                    </DropdownItem>
                    <DropdownItem>
                      <NavLink tag={RRNavLink} to="/movies/nowplaying">Now Playing</NavLink>
                    </DropdownItem>
                    <DropdownItem>
                      <NavLink tag={RRNavLink} to="/movies/comingsoon">Coming Soon</NavLink>
                    </DropdownItem>
                    <DropdownItem>
                      <NavLink tag={RRNavLink} to="/movies/search">Search</NavLink>
                    </DropdownItem>
                    {/* <DropdownItem divider />
                    <DropdownItem>
                      Reset
                    </DropdownItem> */}
                  </DropdownMenu>
                </UncontrolledDropdown>

                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    My Movies
                  </DropdownToggle>
                  <DropdownMenu dark end>
                    <DropdownItem>
                      <NavLink tag={RRNavLink} to="/movies/watchlist">Watchlist</NavLink>
                    </DropdownItem>
                    <DropdownItem>
                      <NavLink tag={RRNavLink} to="/movies/seen">Movies I've Seen</NavLink>
                    </DropdownItem>
                    <DropdownItem>
                      <NavLink tag={RRNavLink} to="/movies/liked">Liked Movies</NavLink>
                    </DropdownItem>
                    <DropdownItem>
                      <NavLink tag={RRNavLink} to="/movies/disliked">Disliked Movies</NavLink>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </>
            }
          </Nav>
          <Nav navbar>

            {isLoggedIn &&
              <>
                <NavbarText id="username">
                  {user.username}
                </NavbarText>
                <NavItem className="me-5" id="logout">
                  <a aria-current="page" id="logout" className="nav-link" href="/logout"
                    style={{ cursor: "pointer" }} onClick={logout}>Logout</a>
                </NavItem>
              </>
            }

            {!isLoggedIn &&
              <>
                <NavItem>
                  <NavLink tag={RRNavLink} to="/login">Login</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={RRNavLink} to="/register">Register</NavLink>
                </NavItem>
              </>
            }
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
}
