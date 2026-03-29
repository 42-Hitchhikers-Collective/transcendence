import { Card, CardContent } from "@/shared/components/ui/card";
import { Header } from "./formCard/Header";
import { Form } from "./formCard/Fields";
import type { SignupProps, FormFields } from "../Types";

export function Signup({
  onRequestMode,
  onSignup,
  error,
  isLoading,
}: SignupProps) {
  const formFields: FormFields[] = [
    { id: "username", label: "Username", type: "text" },
    { id: "password", label: "PassWord", type: "text" },
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
