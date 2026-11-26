import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Dashboard from "../../components/Dashboard/Dashboard";

export default function Home() {
  const location = useLocation();

  const { selectedOrgAppDetails } = useSelector((state) => state?.data);

  return (
    <>
      {location.pathname === "/home" &&
        selectedOrgAppDetails.orgName &&
        selectedOrgAppDetails.appName && <Dashboard />}
    </>
  );
}
