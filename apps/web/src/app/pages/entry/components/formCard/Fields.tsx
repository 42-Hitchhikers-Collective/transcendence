/* 
NOTES FOR TEAM: Form is a components that renders input lables for signing up or logging in, depending on the active mode.
It also handles login and signup logic by calling the appropriate functions passed as props and passes the right data depending on the active mode.
handleLogin and handleSignup functions are defined in the useEntry hook for now but not yet implemented.
*/

import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

import type { FormFields } from "../../Types";
import { useEffect } from "react";

interface AuthFormProps {
  formFields: FormFields[];
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
  submitLabel?: string;
  error?: string | null;
  isLoading?: boolean;
}

export function Form({
  formFields,
  onSubmit,
  submitLabel,
  isLoading,
  error,
}: AuthFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      formFields.map((field) => [field.id, field.initialValue ?? ""])) as Record<string, string>
  );

  useEffect(() => {
    setFormData(
      Object.fromEntries(
        formFields.map((field) => [field.id, field.initialValue ?? ""]),
      ),
    );
  }, [formFields]);

  const handleChange = (id: string, value: string) =>
    setFormData((p) => ({ ...p, [id]: value }));

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {formFields.map((field) => (
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
              value={formData[field.id] ?? ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
          </Field>
        ))}
        
        {error && <p className="text-destructive text-center text-sm">{error}</p>}

        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : submitLabel}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
