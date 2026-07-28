import React, { useContext, useState } from "react";
import {
  Button,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../Repositories/UserProvider";
import Swal from "../../sweetAlert";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      await Swal.fire({
        title: "Passwords do not match",
        text: "Please enter the same password in both fields.",
        icon: "warning",
        confirmButtonText: "Try again",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ username, email, password });
      await Swal.fire({
        title: "Account created",
        text: "You can now log in to the Catacombs.",
        icon: "success",
        confirmButtonText: "Continue to login",
      });
      navigate("/login");
    } catch (error) {
      await Swal.fire({
        title: "Unable to create account",
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
      <section className="auth-card" aria-labelledby="register-heading">
        <p className="auth-eyebrow">Create your collection</p>
        <h1 id="register-heading">Join the Catacombs</h1>
        <p className="auth-intro">
          Create an account to save movies and track what you have watched.
        </p>

        <Form onSubmit={registerSubmit} aria-busy={isSubmitting}>
          <fieldset disabled={isSubmitting}>
            <FormGroup>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                required
                minLength="2"
                maxLength="50"
                autoComplete="username"
                autoFocus
                onChange={(event) => setUsername(event.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                required
                maxLength="320"
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                required
                minLength="15"
                maxLength="128"
                autoComplete="new-password"
                aria-describedby="password-help"
                onChange={(event) => setPassword(event.target.value)}
              />
              <p id="password-help" className="auth-help">
                Use at least 15 characters. A memorable passphrase works well.
              </p>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                required
                minLength="15"
                maxLength="128"
                autoComplete="new-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </FormGroup>
            <Button color="primary" className="auth-submit" type="submit">
              {isSubmitting ? (
                <>
                  <Spinner size="sm" aria-hidden="true" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </fieldset>
        </Form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </Container>
  );
}
