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
import PasswordInput from "./PasswordInput";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate("/");
    } catch (error) {
      await Swal.fire({
        title: "Unable to log in",
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
      <section className="auth-card" aria-labelledby="login-heading">
        <p className="auth-eyebrow">Welcome back</p>
        <h1 id="login-heading">Enter the Catacombs</h1>
        <p className="auth-intro">
          Log in to reach your watchlist and movie collection.
        </p>

        <Form onSubmit={loginSubmit} aria-busy={isSubmitting}>
          <fieldset disabled={isSubmitting}>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                required
                maxLength="320"
                autoComplete="email"
                autoFocus
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                required
                maxLength="128"
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormGroup>
            <Button className="auth-submit" type="submit">
              {isSubmitting ? (
                <>
                  <Spinner size="sm" aria-hidden="true" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </fieldset>
        </Form>

        <p className="auth-switch">
          New to the Catacombs? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </Container>
  );
}
