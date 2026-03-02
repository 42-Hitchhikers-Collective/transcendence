import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/components/ui/card";
import { AuthForm } from "./AuthForm";
import { AuthSocial } from "./AuthSocial";
import { AuthHeader } from "./AuthHeader";

//  TODO: move the interfaces to a separate files, to check if there are any duplicates and better control logic

export type AuthMode = "login" | "signup";

interface AuthCardProps extends React.ComponentProps<"div"> {
  mode: AuthMode;
  onToggleMode: () => void;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleSignup: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

// Config is used to avoid using conditionals or ternaries in the JSX, which can get messy.
// Instead, we can just look up the values we need based on the mode.
const config: Record<
  AuthMode,
  { title: string; description: string; togglePageName: string }
> = {
  login: {
    title: "Log in",
    description: "Don't have an account?",
    togglePageName: "Sign up for free",
  },
  signup: {
    title: "Create your account",
    description: "Already have an account?",
    togglePageName: "Sign in",
  },
};

export function AuthCard({
  className,
  mode,
  onToggleMode,
  handleLogin,
  handleSignup,
  error,
  isLoading,
  ...props
}: AuthCardProps) {
  const { title, description, togglePageName } = config[mode];

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <AuthHeader
          cardTitle={title}
          cardDescription={description}
          togglePageName={togglePageName}
          onToggleMode={onToggleMode}
        />
        <CardContent className="flex flex-col gap-4">
          <AuthForm
            mode={mode}
            handleLogin={handleLogin}
            handleSignup={handleSignup}
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
