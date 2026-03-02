import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/components/ui/card";
import { EntryForm } from "./EntryForm";
import { EntrySocial } from "./EntrySocial";
import { EntryHeader } from "./EntryHeader";

//  TODO: move the interfaces to a separate files, to check if there are any duplicates and better control logic

export type EntryMode = "login" | "signup";

interface EntryCardProps extends React.ComponentProps<"div"> {
  mode: EntryMode;
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
  EntryMode,
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

export function EntryCard({
  className,
  mode,
  onToggleMode,
  handleLogin,
  handleSignup,
  error,
  isLoading,
  ...props
}: EntryCardProps) {
  const { title, description, togglePageName } = config[mode];

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <EntryHeader
          cardTitle={title}
          cardDescription={description}
          togglePageName={togglePageName}
          onToggleMode={onToggleMode}
        />
        <CardContent className="flex flex-col gap-4">
          <EntryForm
            mode={mode}
            handleLogin={handleLogin}
            handleSignup={handleSignup}
            error={error}
            isLoading={isLoading}
          />
          <EntrySocial />
        </CardContent>
      </Card>
      {/* <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription> */}
    </div>
  );
}
