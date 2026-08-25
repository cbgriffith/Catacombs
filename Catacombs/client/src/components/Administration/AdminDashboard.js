import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faMagnifyingGlass,
  faRotateRight,
  faShieldHalved,
  faUserCheck,
  faUserLock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Container, Spinner } from "reactstrap";
import Swal from "../../sweetAlert";
import { UserContext } from "../Repositories/UserProvider";
import {
  banAdminUser,
  getAdminUsers,
  unbanAdminUser,
} from "./adminApi";
import "./AdminDashboard.css";

const statusFilters = [
  { value: "all", label: "All accounts" },
  { value: "active", label: "Active accounts" },
  { value: "banned", label: "Banned accounts" },
  { value: "admin", label: "Administrators" },
];

const formatBannedDate = (dateValue) => {
  if (!dateValue) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
};

export default function AdminDashboard() {
  const { userProfile } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyUserId, setBusyUserId] = useState(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      setUsers(await getAdminUsers());
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const summary = useMemo(() => ({
    total: users.length,
    active: users.filter((user) => !user.isBanned).length,
    banned: users.filter((user) => user.isBanned).length,
    admins: users.filter((user) => user.role === "admin").length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = !normalizedSearch
        || user.username.toLowerCase().includes(normalizedSearch)
        || user.email.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "active" && !user.isBanned)
        || (statusFilter === "banned" && user.isBanned)
        || (statusFilter === "admin" && user.role === "admin");

      return matchesSearch && matchesStatus;
    });
  }, [searchText, statusFilter, users]);

  const replaceUser = (updatedUser) => {
    setUsers((currentUsers) => currentUsers.map((user) => (
      user.id === updatedUser.id ? updatedUser : user
    )));
  };

  const banUser = async (user) => {
    const result = await Swal.fire({
      title: `Ban ${user.username}?`,
      text: "They will be signed out and unable to log back in until the ban is removed.",
      icon: "warning",
      input: "textarea",
      inputLabel: "Reason (optional)",
      inputPlaceholder: "Add a short note for the account record...",
      inputAttributes: {
        maxlength: "500",
        "aria-label": `Reason for banning ${user.username}`,
      },
      showCancelButton: true,
      confirmButtonText: "Ban account",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setBusyUserId(user.id);
    try {
      replaceUser(await banAdminUser(user.id, result.value?.trim() ?? ""));
      await Swal.fire({
        title: "Account sealed",
        text: `${user.username} can no longer enter the Catacombs.`,
        icon: "success",
        confirmButtonText: "Done",
      });
    } catch (error) {
      await Swal.fire({
        title: "Unable to ban account",
        text: error.message,
        icon: "error",
        confirmButtonText: "Close",
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const unbanUser = async (user) => {
    const result = await Swal.fire({
      title: `Restore ${user.username}?`,
      text: "This account will be able to log in again immediately.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Restore account",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setBusyUserId(user.id);
    try {
      replaceUser(await unbanAdminUser(user.id));
      await Swal.fire({
        title: "Account restored",
        text: `${user.username} can enter the Catacombs again.`,
        icon: "success",
        confirmButtonText: "Done",
      });
    } catch (error) {
      await Swal.fire({
        title: "Unable to restore account",
        text: error.message,
        icon: "error",
        confirmButtonText: "Close",
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const summaryCards = [
    { label: "Total accounts", value: summary.total, icon: faUsers },
    { label: "Active", value: summary.active, icon: faUserCheck },
    { label: "Banned", value: summary.banned, icon: faUserLock },
    { label: "Administrators", value: summary.admins, icon: faShieldHalved },
  ];

  return (
    <main className="admin-page">
      <Container>
        <header className="admin-hero">
          <div>
            <p className="admin-eyebrow">Restricted archive</p>
            <h1>Account administration</h1>
            <p>
              Review who has entered the Catacombs and control access
              without touching the database directly.
            </p>
          </div>
          <span className="admin-access-badge">
            <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" />
            Administrator access
          </span>
        </header>

        <section className="admin-summary" aria-label="Account summary">
          {summaryCards.map((card) => (
            <article className="admin-summary-card" key={card.label}>
              <span className="admin-summary-icon">
                <FontAwesomeIcon icon={card.icon} aria-hidden="true" />
              </span>
              <span className="admin-summary-value">{card.value}</span>
              <span className="admin-summary-label">{card.label}</span>
            </article>
          ))}
        </section>

        <section className="admin-account-panel" aria-labelledby="accounts-heading">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">User records</p>
              <h2 id="accounts-heading">Accounts</h2>
            </div>
            <button
              type="button"
              className="admin-refresh-button"
              onClick={loadUsers}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faRotateRight} aria-hidden="true" />
              Refresh
            </button>
          </div>

          <div className="admin-toolbar">
            <label className="admin-search-field">
              <span className="visually-hidden">Search accounts</span>
              <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search by username or email"
              />
            </label>
            <label className="admin-filter-field">
              <span className="visually-hidden">Filter accounts by status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {statusFilters.map((filter) => (
                  <option value={filter.value} key={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {errorMessage ? (
            <div className="admin-error" role="alert">
              <div>
                <strong>The account archive could not be opened.</strong>
                <span>{errorMessage}</span>
              </div>
              <button type="button" onClick={loadUsers}>Try again</button>
            </div>
          ) : isLoading ? (
            <div className="admin-loading" role="status">
              <Spinner size="sm" aria-hidden="true" />
              Opening the account archive...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-empty">
              <strong>No accounts found.</strong>
              <span>Try changing your search or account filter.</span>
            </div>
          ) : (
            <>
              <p className="admin-result-count" aria-live="polite">
                Showing {filteredUsers.length} of {users.length} accounts
              </p>
              <div className="admin-user-list">
                {filteredUsers.map((user) => {
                  const isAdministrator = user.role === "admin";
                  const isCurrentUser = user.id === userProfile.id;
                  const isBusy = busyUserId === user.id;

                  return (
                    <article
                      className={`admin-user-row${user.isBanned ? " is-banned" : ""}`}
                      key={user.id}
                    >
                      <span className="admin-user-avatar" aria-hidden="true">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                      <div className="admin-user-identity">
                        <div className="admin-user-name-line">
                          <h3>{user.username}</h3>
                          {isCurrentUser && <span className="admin-you-badge">You</span>}
                        </div>
                        <a href={`mailto:${user.email}`}>{user.email}</a>
                        {user.isBanned && (
                          <p className="admin-ban-note">
                            Banned {formatBannedDate(user.bannedAt)}
                            {user.banReason ? ` — ${user.banReason}` : ""}
                          </p>
                        )}
                      </div>
                      <div className="admin-user-status">
                        {isAdministrator && (
                          <span className="admin-role-badge">
                            <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" />
                            Admin
                          </span>
                        )}
                        <span className={user.isBanned ? "admin-status-banned" : "admin-status-active"}>
                          {user.isBanned ? "Banned" : "Active"}
                        </span>
                      </div>
                      <div className="admin-user-actions">
                        {isAdministrator ? (
                          <span className="admin-protected-label">Protected account</span>
                        ) : user.isBanned ? (
                          <button
                            type="button"
                            className="admin-restore-button"
                            onClick={() => unbanUser(user)}
                            disabled={isBusy}
                          >
                            <FontAwesomeIcon icon={faUserCheck} aria-hidden="true" />
                            {isBusy ? "Restoring..." : "Restore"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-ban-button"
                            onClick={() => banUser(user)}
                            disabled={isBusy}
                          >
                            <FontAwesomeIcon icon={faBan} aria-hidden="true" />
                            {isBusy ? "Banning..." : "Ban"}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </Container>
    </main>
  );
}
