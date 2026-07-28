import React, { useState, useContext } from "react";
import { Button, Container, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Repositories/UserProvider";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const registerClick = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match. Try again.");
    } else {
      const userProfile = { username, email, password };
      register(userProfile)
        .then(() => {
          alert("Account created. You can now log in.");
          navigate("/login");
        })
        .catch((error) => alert(error.message));
    }
  };

  return (
    <Container className="mt-5">
      <Form onSubmit={registerClick}>
        <fieldset>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input style={{color: "black"}} id="username" type="text" required minLength="2" maxLength="50" onChange={e => setUsername(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input id="email" type="email" required maxLength="320" onChange={e => setEmail(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label for="password">Password</Label>
            <Input id="password" type="password" required minLength="15" maxLength="128" onChange={e => setPassword(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label for="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" required minLength="15" maxLength="128" onChange={e => setConfirmPassword(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Button>Register</Button>
          </FormGroup>
        </fieldset>
      </Form>
    </Container>
  );
}
