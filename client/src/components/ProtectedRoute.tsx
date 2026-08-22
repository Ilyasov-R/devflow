import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "../app/hooks";

const ProtectedRoute = () => {
  const { token } = useAppSelector(
    (state) => state.auth,
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;