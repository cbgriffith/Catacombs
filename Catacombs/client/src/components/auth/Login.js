import React, { useState, useContext } from "react";
import { Button, Container, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../Repositories/UserProvider";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginSubmit = (e) => {
    e.preventDefault();
    login({ email, password })
      .then(() => navigate("/"))
      .catch((error) => alert(error.message));
  };

  return (
    <Container className="mt-5">
      <Form onSubmit={loginSubmit}>
        <fieldset>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input id="email" type="email" required maxLength="320" autoComplete="email" onChange={e => setEmail(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label for="password">Password</Label>
            <Input id="password" type="password" required maxLength="128" autoComplete="current-password" onChange={e => setPassword(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Button>Login</Button>
          </FormGroup>
          <em>
            Not registered? <Link to="/register">Register</Link>
          </em>
        </fieldset>
      </Form>
    </Container>
  );
}
