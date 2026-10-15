import { useOutletContext } from "react-router";
import { Login } from "@/features/auth/pages/Login";

export function LoginRoute() {
  const onAuthenticated = useOutletContext<(token: string) => void>();

  return <Login onAuthenticated={onAuthenticated} />;
}
