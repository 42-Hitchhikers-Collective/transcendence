import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/components/ui/card";
import { LoginForm } from "./LoginForm";
import { LoginSocial } from "./LoginSocial";
import { LoginHeader } from "./LoginHeader";

interface LoginCardProps extends React.ComponentProps<"div"> {
  handleLogin: (username: string, password: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

export function LoginCard({
  className,
  handleLogin,
  error,
  isLoading,
  ...props
}: LoginCardProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <LoginHeader
          cardTitle="Log in"
          cardDescription="Don't have an account? Sign up for free."
        />
        <CardContent className="flex flex-col gap-4">
          <LoginForm
            handleLogin={handleLogin}
            error={error}
            isLoading={isLoading}
          />
          <LoginSocial />
        </CardContent>
      </Card>
      {/* <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription> */}
    </div>
  );
}
