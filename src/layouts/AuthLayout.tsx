import { useState } from "react";
import { Outlet } from "react-router";

export function AuthLayout() {
  const [, setToken] = useState(() => localStorage.getItem("token"));

  return <Outlet context={setToken} />;
}
