import { Card } from "@/shared/components/ui/card";

import { Header } from "./formCard/Header";
import { CardContent } from "@/shared/components/ui/card";
import type { LoginProps, FormFields } from "../types";
import { Form } from "./formCard/Fields";

export function Login({
  onRequestMode,
  onLogin,
  error,
}: LoginProps) {
  const formFields: FormFields[] = [
    { id: "email", label: "Email", type: "email" },
    { id: "password", label: "Password", type: "password" },
  ];

  const handleSubmit = async (values: Record<string, string>) => {
    await onLogin(values);
    // console.log(`login submitted - Username:"${values.username}" password:"${values.password}"`);
  };

  return (
    <Card className="h-full rounded-2xl border-2 border-gray-200 bg-white shadow-2xl shadow-slate-900 justify-center">
      <Header
        cardTitle={"Log in"}
        cardDescription="Don't have an account?"
        togglePageName="Sign up for free"
        toggleTarget="signup"
        onRequestMode={onRequestMode}
      />
      <CardContent className="flex flex-col gap-2 md:gap-4 px-8 md:px-20">
        <Form
          formFields={formFields}
          onSubmit={handleSubmit}
          submitLabel="Log in"
          isLoading={false}
          error={error}
        />
      </CardContent>
    </Card>
  );
}
