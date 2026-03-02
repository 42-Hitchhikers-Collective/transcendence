/* 
NOTES FOR TEAM: AuthForm is a components that renders input lables for signing up or logging in, depending on the active mode.
It also handles login and signup logic by calling the appropriate functions passed as props and passes the right data depending on the active mode.
handleLogin and handleSignup functions are defined in the useAuth hook for now but not yet implemented.
*/

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import type { AuthMode } from "./AuthCard";

//  TODO: move the interfaces to a separate files, to check if there are any duplicates and better control logic
interface AuthFormProps {
  mode: AuthMode;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleSignup: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

interface FieldConfig {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  extra?: React.ReactNode;
}

const loginFields: FieldConfig[] = [
  {
    id: "username",
    label: "Username",
    type: "text",
    placeholder: "user1",
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "pass1",
    extra: (
      <a
        href="#"
        className="ml-auto text-sm underline-offset-4 hover:underline"
      >
        Forgot your password?
      </a>
    ),
  },
];

const signupFields: FieldConfig[] = [
  {
    id: "name",
    label: "Full Name",
    type: "text",
    placeholder: "John Doe",
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "m@example.com",
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "",
  },
  {
    id: "confirm-password",
    label: "Confirm Password",
    type: "password",
    placeholder: "",
  },
];

const fieldsByMode: Record<AuthMode, FieldConfig[]> = {
  login: loginFields,
  signup: signupFields,
};

const submitConfig: Record<AuthMode, { label: string; loadingLabel: string }> =
  {
    login: { label: "Login", loadingLabel: "Logging in..." },
    signup: { label: "Create Account", loadingLabel: "Creating account..." },
  };

export function AuthForm({
  mode,
  handleLogin,
  handleSignup,
  error,
  isLoading,
}: AuthFormProps) {
  const fields = fieldsByMode[mode];
  const { label, loadingLabel } = submitConfig[mode];
  const [formData, setFormData] = useState<Record<string, string>>(
    Object.fromEntries(fieldsByMode[mode].map((entry) => [entry.id, ""])),
  );

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  /* 
  NOTE TO TEAM: Handles submit depending on the active mode. 
  If mode is login it will call handleLogin with username and password, if mode is signup it will call handleSignup with name, email and password. 
  */
  // TODO: Something does not convince me about this approach, just leaving as a reference for when implementing mock login and signup feature to test this out.
  const handleSubmit = async (e: React.SubmitEvent) => {
    // TODO: check if riht event type as FormEvent is deprecated, i need to find out
    e.preventDefault();
    if (mode === "login") {
      await handleLogin(formData.username, formData.password);
    } else {
      await handleSignup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {fields.map((field) => (
          <Field key={field.id}>
            <div className="flex items-center">
              <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
              {field.extra}
            </div>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              required
              value={formData[field.id]}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
          </Field>
        ))}
        {mode === "signup" && (
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        )}
        {error && (
          <p className="text-destructive text-center text-sm">{error}</p>
        )}
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? loadingLabel : label}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
