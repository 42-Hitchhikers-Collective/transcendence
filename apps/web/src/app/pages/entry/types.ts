

/* AuthPage types */
export type AuthMode = "login" | "signup";
export interface AuthPageProps {
  mode?: AuthMode;
  onRequestMode?: (target?: AuthMode) => void;
}

export type InputType = "username" | "password";
export type FormFields = {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  extra?: React.ReactNode;
  initialValue?: string; /* why was it added?  */
};

export type FieldValues = Record<string, string>;
export type SubmitHandler<T = FieldValues> = (
  values: T,
) => Promise<void> | void;

export type FormErrors = Partial<Record<string, string>>;



export interface LoginProps {
  onLogin: (values: Record<string, string>) => Promise<void>;
  onRequestMode: () => void;
  error?: string | null;
  isLoading?: boolean;
}

export interface SignupProps {
  onSignup: (values: Record<string, string>) => Promise<void>;
  onRequestMode: () => void;
  error?: string | null;
  isLoading?: boolean;
}
