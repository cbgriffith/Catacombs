import React, { useState, useContext } from "react";
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
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faCalendar,
  faCompass,
  faEye,
  faFire,
  faFolderOpen,
  faGem,
  faHeart,
  faKey,
  faMagnifyingGlass,
  faRightFromBracket,
  faThumbsDown,
  faTicket,
  faTrophy,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "./Repositories/UserProvider";
import catacombsMark from "./Movies/images/catacombs-mark.png";
import Swal from "../sweetAlert";
import "./Header.css";

const HeaderMenuItem = ({
  to,
  icon,
  label,
  description,
  onClick
}) => (
  <DropdownItem
    tag={RRNavLink}
    to={to}
    onClick={onClick}
  >
    <span className="header-menu-icon" aria-hidden="true">
      <FontAwesomeIcon icon={icon} />
    </span>
    <span className="header-menu-copy">
      <span className="header-menu-label">{label}</span>
      <span className="header-menu-description">
        {description}
      </span>
    </span>
  </DropdownItem>
);

export default function Header() {
  const { isLoggedIn, logout, userProfile } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const discoverIsActive = [
    "/movies/rating",
    "/movies/popular",
    "/movies/hidden-gems",
    "/movies/nowplaying",
    "/movies/comingsoon",
    "/movies/similar",
    "/movies/details"
  ].some(path => location.pathname.startsWith(path));
  const myMoviesIsActive = [
    "/movies/watchlist",
    "/movies/seen",
    "/movies/liked",
    "/movies/disliked"
  ].some(path => location.pathname.startsWith(path));
  const findMoviesIsActive = [
    "/movies/search",
    "/movies/browse"
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
                <UncontrolledDropdown
                  nav
                  inNavbar
                  className="header-navigation-dropdown"
                >
                  <DropdownToggle
                    nav
                    caret
                    className={discoverIsActive ? "active" : ""}
                  >
                    <span className="header-nav-label">
                      <FontAwesomeIcon
                        icon={faCompass}
                        aria-hidden="true"
                      />
                      Discover
                    </span>
                  </DropdownToggle>
                  <DropdownMenu
                    dark
                    className="header-navigation-menu"
                  >
                    <HeaderMenuItem
                      to="/movies/rating"
                      icon={faTrophy}
                      label="Top Rated"
                      description="The archive's highest scores"
                      onClick={closeMenu}
                    />
                    <HeaderMenuItem
                      to="/movies/popular"
                      icon={faFire}
                      label="Most Popular"
                      description="What horror fans are watching"
                      onClick={closeMenu}
                    />
                    <HeaderMenuItem
                      to="/movies/hidden-gems"
                      icon={faGem}
                      label="Hidden Gems"
                      description="Great scares off the beaten path"
                      onClick={closeMenu}
                    />
                    <HeaderMenuItem
                      to="/movies/nowplaying"
                      icon={faTicket}
                      label="Now Playing"
                      description="Horror currently in theaters"
                      onClick={closeMenu}
                    />
                    <HeaderMenuItem
                      to="/movies/comingsoon"
                      icon={faCalendar}
                      label="Coming Soon"
                      description="Upcoming theatrical releases"
                      onClick={closeMenu}
                    />
                  </DropdownMenu>
                </UncontrolledDropdown>

                <NavItem>
                  <NavLink
                    tag={RRNavLink}
                    to="/movies/search"
                    className={findMoviesIsActive ? "active" : ""}
                    onClick={closeMenu}
                  >
                    <span className="header-nav-label">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        aria-hidden="true"
                      />
                      Search
                    </span>
                  </NavLink>
                </NavItem>

                <UncontrolledDropdown
                  nav
                  inNavbar
                  className="header-navigation-dropdown"
                >
                  <DropdownToggle
                    nav
                    caret
                    className={myMoviesIsActive ? "active" : ""}
                  >
                    <span className="header-nav-label">
                      <FontAwesomeIcon
                        icon={faFolderOpen}
                        aria-hidden="true"
                      />
                      My Archive
                    </span>
                  </DropdownToggle>
                  <DropdownMenu
                    dark
                    className="header-navigation-menu"
                  >
                    <HeaderMenuItem
                      to="/movies/watchlist"
                      icon={faBookmark}
                      label="Watchlist"
                      description="Movies waiting in the dark"
                      onClick={closeMenu}
                    />
                    <HeaderMenuItem
                      to="/movies/seen"
                      icon={faEye}
                      label="Viewing Log"
                      description="Everything you've survived"
                      onClick={closeMenu}
                    />
                    <HeaderMenuItem
                      to="/movies/liked"
                      icon={faHeart}
                      label="Loved"
                      description="Favorites worth revisiting"
                      onClick={closeMenu}
                    />
                    <HeaderMenuItem
                      to="/movies/disliked"
                      icon={faThumbsDown}
                      label="Not for Me"
                      description="The reject pile"
                      onClick={closeMenu}
                    />
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
                  <span className="header-account-label">
                    <FontAwesomeIcon
                      icon={faUser}
                      aria-hidden="true"
                    />
                    {userProfile.username}
                  </span>
                </DropdownToggle>
                <DropdownMenu
                  dark
                  end
                  className="header-account-menu"
                >
                  <DropdownItem
                    tag={RRNavLink}
                    to="/account/password"
                    className="header-account-action"
                    onClick={closeMenu}
                  >
                    <FontAwesomeIcon
                      icon={faKey}
                      aria-hidden="true"
                    />
                    <span>Change password</span>
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem
                    className="header-logout-item header-account-action"
                    disabled={isLoggingOut}
                    onClick={logoutClick}
                  >
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      aria-hidden="true"
                    />
                    <span>
                      {isLoggingOut
                        ? "Logging out..."
                        : "Log out"}
                    </span>
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
