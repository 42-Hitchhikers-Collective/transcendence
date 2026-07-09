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

// SQL injection & XSS pattern detection — defense-in-depth.
// Real prevention: Prisma parameterized queries + Fastify schema validation on backend.
// This catches attack patterns BEFORE they reach the server.
function hasSqlInjection(value: string): boolean {
  // ── SQL meta-characters (blocked in username, email, any text input) ──
  // Single quote  → SQL string delimiter, classic injection vector
  // Double quote  → SQL identifier delimiter
  // Semicolon     → stacked queries: SELECT 1; DROP TABLE users;
  // Equals        → ' OR 1=1 --  (most common injection pattern)
  // Backslash     → escape character abuse
  if (/['\";=\\]/.test(value)) return true;

  // ── SQL comment markers (terminate a query early) ──
  // --         → line comment:  ' OR 1=1 --
  // /* */      → block comment: ' OR 1=1 /*
  // #          → MySQL comment
  if (/--|\/\*|\*\/|#/.test(value)) return true;

  const upper = value.toUpperCase();

  // ── Classic injection tautologies (always-true conditions) ──
  // ' OR 1=1', ' OR '1'='1', ' OR 'a'='a, ' AND 1=1, etc.
  if (/\bOR\s+['\d]|['\d]\s*=\s*['\d]|\bAND\s+['\d]/.test(upper)) return true;

  // ── SQL DML / DDL keywords (data manipulation & definition) ──
  // These should NEVER appear in a username, email, or any form field
  if (/\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC(UTE)?|GRANT|REVOKE|DECLARE|FETCH)\b/i.test(upper)) return true;

  // ── Information schema / system table access ──
  if (/\b(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS|PG_CLASS|PG_TABLES)\b/i.test(upper)) return true;

  // ── Encoded / hex injection ──
  // 0xDEADBEEF, CHAR(65,66,67), CONCAT(...), LOAD_FILE, INTO OUTFILE
  if (/\b(0x[0-9A-F]{2,}|CHAR\s*\(|CONCAT\s*\(|LOAD_FILE|INTO\s+(OUT|DUMP)FILE)\b/i.test(upper)) return true;

  // ── Comment-based filter evasion ──
  // ' OR/**/1=1  (comment between keywords to bypass WAF)
  if (/\/\*[*!]?.*\*\//.test(value)) return true;

  return false;
}

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

    // Client-side validation
    for (const field of formFields) {
      const value = formData[field.id]?.trim() ?? "";
      if (!value) {
        setClientError(`Please enter your ${field.label.toLowerCase()}`);
        return;
      }
      // SQL injection pattern check (skip for passwords — they're hashed anyway)
      if (field.id !== "password" && hasSqlInjection(value)) {
        setClientError("Input contains invalid characters or patterns");
        return;
      }
      if (field.id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setClientError("Please enter a valid email address");
        return;
      }
      if (field.id === "password" && value.length < 8) {
        setClientError("Password must be at least 8 characters");
        return;
      }
      if (field.id === "username" && (value.length < 1 || value.length > 20)) {
        setClientError("Username must be between 1 and 20 characters");
        return;
      }
    }

    // Password confirmation check
    const password = formData["password"]?.trim() ?? "";
    const confirm = formData["confirm-password"]?.trim() ?? "";
    if (confirm && password !== confirm) {
      setClientError("Passwords do not match");
      return;
    }

    setClientError(null);
    onSubmit(formData);
  };

  const [clientError, setClientError] = useState<string | null>(null);

  const displayError = clientError || error;

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-2 md:gap-4">
        {formFields.map((field) => (
          <Field key={field.id}>
            <div className="flex items-center">
              <FieldLabel
                htmlFor={field.id}
                className="text-xs md:text-sm"
              >
                {field.label}
              </FieldLabel>
              {field.extra}
            </div>
            <Input
              className="bg-slate-500/20 text-slate-800 border-0 text-xs md:text-sm h-8 md:h-10"
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              required
              value={formData[field.id] ?? ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
          </Field>
        ))}

        {displayError && (
          <p className="text-destructive text-center text-xs">{displayError}</p>
        )}

        <Field>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-400 mt-5 hover:bg-emerald-500 text-white active:scale-95 transition-transform text-xs md:text-sm h-8 md:h-11"
          >
            {isLoading ? `Loading ${submitLabel} request..` : submitLabel}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
