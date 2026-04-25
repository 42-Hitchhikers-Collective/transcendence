import {
  Card,
} from "@/shared/components/ui/card";

import { Header } from "./formCard/Header";
import { CardContent } from "@/shared/components/ui/card";
import type { LoginProps, FormFields } from "../types";
import { Form } from "./formCard/Fields";

export function Login({
  onRequestMode,
  onLogin,
  error,
  isLoading,
}: LoginProps) {
  const formFields: FormFields[] = [
    { id: "email", label: "Email", type: "text" },
    { id: "password", label: "Password", type: "password" },
  ];

  const handleSubmit = async (values: Record<string, string>) => {
    await onLogin(values);
    // console.log(`login submitted - Username:"${values.username}" password:"${values.password}"`);
  };

  return (
    <div className="w-lg mx-auto">
      <Card>
        <Header
          cardTitle={"Log in"}
          cardDescription="Don't have an account?"
          togglePageName="Sign up for free"
          toggleTarget="signup"
          onRequestMode={onRequestMode}
        />
        <CardContent className="flex flex-col gap-4">
          <Form
            formFields={formFields}
            onSubmit={handleSubmit}
            submitLabel="Log in"
            isLoading={false}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}
