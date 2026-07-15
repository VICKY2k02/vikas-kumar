import { Navigate } from "react-router-dom";

const RoleRoute = ({
  children,
  roles
}: any) => {

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  if (
    !roles.includes(user.role)
  ) {

    return <Navigate to="/" />;

  }

  return children;
};

export default RoleRoute;