import { Card, CardContent } from "@/shared/components/ui/card";
import { Header } from "./formCard/Header";
import { Form } from "./formCard/Fields";
import type { SignupProps, FormFields } from "../types";

export function Signup({
  onRequestMode,
  onSignup,
  error,
}: SignupProps) {
  const formFields: FormFields[] = [
    { id: "email", label: "Email", type: "email" },
    { id: "username", label: "Username", type: "text" },
    { id: "password", label: "Password", type: "password" },
    // { id: "confirm-password", label: "Confirm Password", type: "password" },
  ];

  const handleSubmit = async (values: Record<string, string>) => {
    await onSignup(values);
    // console.log(
    //   `signup submitted - Username:"${values.username}" password:"${values.password}"`,
    // );
  };

  return (
    <Card className="h-full rounded-2xl border-2 border-gray-900 shadow-2xl shadow-slate-900 bg-black text-white justify-center">
      <Header
        cardTitle={"Sign up"}
        cardDescription="Already have an account?"
        togglePageName="Login"
        toggleTarget="login"
        onRequestMode={onRequestMode}
      />
      <CardContent className="flex flex-col gap-2 md:gap-4 px-4 md:px-8 lg:px-20">
        <Form
          formFields={formFields}
          onSubmit={handleSubmit}
          submitLabel="Sign up"
          isLoading={false}
          error={error}
        />
      </CardContent>
    </Card>
  );
}
