import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/components/ui/card";
import { AuthForm } from "./AuthForm";
import { AuthSocial } from "./AuthSocial";
import { AuthHeader } from "./AuthHeader";

interface AuthCardProps extends React.ComponentProps<"div"> {
  handleLogin: (username: string, password: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

export function AuthCard({
  className,
  handleLogin,
  error,
  isLoading,
  ...props
}: AuthCardProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <AuthHeader
          cardTitle="Log in"
          cardDescription="Don't have an account? Sign up for free."
        />
        <CardContent className="flex flex-col gap-4">
          <AuthForm
            handleLogin={handleLogin}
            error={error}
            isLoading={isLoading}
          />
          <AuthSocial />
        </CardContent>
      </Card>
      {/* <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription> */}
    </div>
  );
}
