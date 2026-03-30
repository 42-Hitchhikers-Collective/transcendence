import { Card, CardContent } from "@/shared/components/ui/card";
import { Header } from "./formCard/Header";
import { Form } from "./formCard/Fields";
import type { SignupProps, FormFields } from "../types";

export function Signup({
  onRequestMode,
  onSignup,
  error,
  isLoading,
}: SignupProps) {
  const formFields: FormFields[] = [
    { id: "email", label: "Email", type: "text" },
    { id: "username", label: "Username", type: "text" },
    { id: "password", label: "Password", type: "password" },
  ];

  const handleSubmit = async (values: Record<string, string>) => {
    await onSignup(values);
    // console.log(
    //   `signup submitted - Username:"${values.username}" password:"${values.password}"`,
    // );
  };

  return (
    <div className="w-lg mx-auto">
      <Card>
        <Header
          cardTitle={"Sign up"}
          cardDescription="Already have an account?"
          togglePageName="Login"
          toggleTarget="login"
          onRequestMode={onRequestMode}
        />
        <CardContent className="flex flex-col gap-4">
          <Form
            formFields={formFields}
            onSubmit={handleSubmit}
            submitLabel="Sign up"
            isLoading={false}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}
