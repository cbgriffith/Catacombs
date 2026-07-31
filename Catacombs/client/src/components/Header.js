import React, { useState, useContext } from 'react';
import {
  NavLink as RRNavLink,
  useLocation,
  useNavigate
} from "react-router-dom";
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
  DropdownItem
} from 'reactstrap';
import { UserContext } from './Repositories/UserProvider';
import catacombsMark from './Movies/images/catacombs-mark.png'
import Swal from "../sweetAlert";
import "./Header.css"

export default function Header() {
  const { isLoggedIn, logout, userProfile } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const browseMoviesIsActive = [
    "/movies/rating",
    "/movies/popular",
    "/movies/hidden-gems",
    "/movies/nowplaying",
    "/movies/comingsoon",
    "/movies/search",
    "/movies/similar",
    "/movies/details"
  ].some(path => location.pathname.startsWith(path));
  const myMoviesIsActive = [
    "/movies/watchlist",
    "/movies/seen",
    "/movies/liked",
    "/movies/disliked"
  ].some(path => location.pathname.startsWith(path));

  const logoutClick = async (event) => {
    event.preventDefault();

    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      closeMenu();
      navigate("/login");
    } catch (error) {
      await Swal.fire({
        title: "Unable to log out",
        text: error.message,
        icon: "error",
        confirmButtonText: "Try again",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Navbar
      dark
      expand="lg"
      sticky="top"
      className="catacombs-navbar"
    >
      <div className="container-xl catacombs-navbar-inner">
        <NavbarBrand
          tag={RRNavLink}
          to="/"
          className="catacombs-brand"
          onClick={closeMenu}
        >
          <img
            className="catacombs-brand-icon"
            src={catacombsMark}
            alt=""
            width="40"
            height="40"
          />
          <span className="catacombs-brand-copy">
            <span className="catacombs-brand-title">
              The Catacombs
            </span>
            <span className="catacombs-brand-subtitle">
              Horror movie archive
            </span>
          </span>
        </NavbarBrand>
        <NavbarToggler
          onClick={toggle}
          aria-label="Toggle navigation"
        />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="catacombs-main-nav me-auto" navbar>
            {isLoggedIn && (
              <>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle
                    nav
                    caret
                    className={
                      browseMoviesIsActive ? "active" : ""
                    }
                  >
                    Movies
                  </DropdownToggle>
                  <DropdownMenu dark>
                    <DropdownItem
                      tag={RRNavLink}
                      to="/movies/rating"
                      onClick={closeMenu}
                    >
                      Top Rated
                    </DropdownItem>
                    <DropdownItem
                      tag={RRNavLink}
                      to="/movies/popular"
                      onClick={closeMenu}
                    >
                      Most Popular
                    </DropdownItem>
                    <DropdownItem
                      tag={RRNavLink}
                      to="/movies/hidden-gems"
                      onClick={closeMenu}
                    >
                      Hidden Gems
                    </DropdownItem>
                    <DropdownItem
                      tag={RRNavLink}
                      to="/movies/nowplaying"
                      onClick={closeMenu}
                    >
                      Now Playing
                    </DropdownItem>
                    <DropdownItem
                      tag={RRNavLink}
                      to="/movies/comingsoon"
                      onClick={closeMenu}
                    >
                      Coming Soon
                    </DropdownItem>
                    <DropdownItem
                      tag={RRNavLink}
                      to="/movies/search"
                      onClick={closeMenu}
                    >
                      Search
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>

                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle
                    nav
                    caret
                    className={
                      myMoviesIsActive ? "active" : ""
                    }
                  >
                    My Movies
                  </DropdownToggle>
                  <DropdownMenu dark>
                    <DropdownItem
                      tag={RRNavLink}
                      to="/movies/watchlist"
                      onClick={closeMenu}
                    >
                      Watch List
                    </DropdownItem>
                    <DropdownItem
                      tag={RRNavLink}
                      to="/movies/seen"
                      onClick={closeMenu}
                    >
                      Movies I've Seen
                    </DropdownItem>
                    <DropdownItem
                      tag={RRNavLink}
                      to="/movies/liked"
                      onClick={closeMenu}
                    >
                      Liked Movies
                    </DropdownItem>
                    <DropdownItem
                      tag={RRNavLink}
                      to="/movies/disliked"
                      onClick={closeMenu}
                    >
                      Disliked Movies
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </>
            )}
          </Nav>

          <Nav className="catacombs-account-nav" navbar>
            {isLoggedIn ? (
              <UncontrolledDropdown
                nav
                inNavbar
                className="header-account-dropdown"
              >
                <DropdownToggle
                  nav
                  caret
                  className={
                    location.pathname.startsWith("/account/")
                      ? "header-account-toggle active"
                      : "header-account-toggle"
                  }
                >
                  {userProfile.username}
                </DropdownToggle>
                <DropdownMenu
                  dark
                  end
                  className="header-account-menu"
                >
                  <DropdownItem
                    tag={RRNavLink}
                    to="/account/password"
                    onClick={closeMenu}
                  >
                    Change password
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem
                    className="header-logout-item"
                    disabled={isLoggingOut}
                    onClick={logoutClick}
                  >
                    {isLoggingOut
                      ? "Logging out..."
                      : "Log out"}
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            ) : (
              <>
                <NavItem>
                  <NavLink
                    tag={RRNavLink}
                    to="/login"
                    onClick={closeMenu}
                  >
                    Log in
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    tag={RRNavLink}
                    to="/register"
                    className="header-register-link"
                    onClick={closeMenu}
                  >
                    Create account
                  </NavLink>
                </NavItem>
              </>
            )}
          </Nav>
        </Collapse>
      </div>
    </Navbar>
  );
}
