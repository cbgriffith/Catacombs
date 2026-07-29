import React, { useState } from "react";
import { Button, Input, Label } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  ...inputProps
}) {
  const [isVisible, setIsVisible] = useState(false);
  const action = isVisible ? "Hide" : "Show";

  return (
    <>
      <Label htmlFor={id}>{label}</Label>
      <div className="auth-password-field">
        <Input
          {...inputProps}
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
        />
        <Button
          className="auth-password-toggle"
          type="button"
          aria-label={`${action} ${label.toLowerCase()}`}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          <FontAwesomeIcon
            icon={isVisible ? faEyeSlash : faEye}
            aria-hidden="true"
          />
          <span>{action}</span>
        </Button>
      </div>
    </>
  );
}
