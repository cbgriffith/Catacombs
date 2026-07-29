import React, { useContext, useState } from "react";
import {
  Button,
  Container,
  Form,
  FormGroup,
  Spinner,
} from "reactstrap";
import { UserContext } from "../Repositories/UserProvider";
import Swal from "../../sweetAlert";
import PasswordInput from "./PasswordInput";
import "./Auth.css";

export default function ChangePassword() {
  const { changePassword } = useContext(UserContext);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changePasswordSubmit = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmNewPassword) {
      await Swal.fire({
        title: "Passwords do not match",
        text: "Please enter the same new password in both fields.",
        icon: "warning",
        confirmButtonText: "Try again",
      });
      return;
    }

    if (currentPassword === newPassword) {
      await Swal.fire({
        title: "Choose a new password",
        text: "Your new password must be different from your current password.",
        icon: "warning",
        confirmButtonText: "Try again",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      await Swal.fire({
        title: "Password changed",
        text: "Your password was updated. Please log in again.",
        icon: "success",
        confirmButtonText: "Continue to login",
      });
    } catch (error) {
      await Swal.fire({
        title: "Unable to change password",
        text: error.message,
        icon: "error",
        confirmButtonText: "Try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="auth-page">
      <section
        className="auth-card"
        aria-labelledby="change-password-heading"
      >
        <p className="auth-eyebrow">Account security</p>
        <h1 id="change-password-heading">Change password</h1>
        <p className="auth-intro">
          Confirm your current password, then choose a new one.
        </p>

        <Form onSubmit={changePasswordSubmit} aria-busy={isSubmitting}>
          <fieldset disabled={isSubmitting}>
            <FormGroup>
              <PasswordInput
                id="currentPassword"
                label="Current password"
                value={currentPassword}
                required
                maxLength="128"
                autoComplete="current-password"
                autoFocus
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <PasswordInput
                id="newPassword"
                label="New password"
                value={newPassword}
                required
                minLength="8"
                maxLength="128"
                autoComplete="new-password"
                aria-describedby="new-password-help"
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <p id="new-password-help" className="auth-help">
                Use at least 8 characters and choose something different.
              </p>
            </FormGroup>
            <FormGroup>
              <PasswordInput
                id="confirmNewPassword"
                label="Confirm new password"
                value={confirmNewPassword}
                required
                minLength="8"
                maxLength="128"
                autoComplete="new-password"
                onChange={(event) =>
                  setConfirmNewPassword(event.target.value)
                }
              />
            </FormGroup>
            <Button className="auth-submit" type="submit">
              {isSubmitting ? (
                <>
                  <Spinner size="sm" aria-hidden="true" />
                  <span>Changing password...</span>
                </>
              ) : (
                "Change password"
              )}
            </Button>
          </fieldset>
        </Form>
      </section>
    </Container>
  );
}
