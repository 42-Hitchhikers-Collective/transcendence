import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

interface LoginFormProps {
  handleLogin: (username: string, password: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const Fields = [
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
    placeholder: "",
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

export function LoginForm({ handleLogin, error, isLoading }: LoginFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>(
    Object.fromEntries(Fields.map((f) => [f.id, ""])),
  );

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    await handleLogin(formData.username, formData.password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {Fields.map((field) => (
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
        {error && (
          <p className="text-destructive text-center text-sm">{error}</p>
        )}
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
