/* 
NOTES FOR TEAM: Form is a components that renders input lables for signing up or logging in, depending on the active mode.
It also handles login and signup logic by calling the appropriate functions passed as props and passes the right data depending on the active mode.
handleLogin and handleSignup functions are defined in the useEntry hook for now but not yet implemented.
*/

import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

import type { FormFields } from "../../types";
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
  const [formData, setFormData] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        formFields.map((field) => [field.id, field.initialValue ?? ""]),
      ) as Record<string, string>,
  );

  const fieldSignature = formFields.map((field) => field.id).join("|");

  useEffect(() => {
    setFormData(
      Object.fromEntries(
        formFields.map((field) => [field.id, field.initialValue ?? ""]),
      ),
    );
  }, [fieldSignature]);

  const handleChange = (id: string, value: string) =>
    setFormData((p) => ({ ...p, [id]: value }));

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-[clamp(0.5rem,2vw,1rem)]">
        {formFields.map((field) => (
          <Field key={field.id}>
            <div className="flex items-center">
              <FieldLabel
                htmlFor={field.id}
                className="text-[clamp(0.65rem,2.2vw,0.875rem)]"
              >
                {field.label}
              </FieldLabel>
              {field.extra}
            </div>
            <Input
              className="bg-slate-500/20 text-slate-800 border-0 text-[clamp(0.7rem,2.2vw,0.875rem)] h-[clamp(2rem,5vw,2.5rem)]"
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              required
              value={formData[field.id] ?? ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
          </Field>
        ))}

        {error && (
          <p className="text-destructive text-center text-[clamp(0.6rem,2vw,0.8rem)]">{error}</p>
        )}

        <Field>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-400 mt-5 hover:bg-emerald-500 text-white active:scale-95 transition-transform text-[clamp(0.65rem,2.2vw,0.875rem)] h-[clamp(2rem,5vw,2.75rem)]"
          >
            {isLoading ? `Loading ${submitLabel} request..` : submitLabel}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
