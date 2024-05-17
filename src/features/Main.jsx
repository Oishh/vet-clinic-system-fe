import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { useClickOutside } from "primereact/hooks";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import avatar from "../resources/sampleAvatar.png";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar.jsx";
import CreateAppointment from "./Appointments/CreateAppointment";
import ManageAppointment from "./Appointments/ManageAppointment";
import Billing from "./Billing/Billing";
import CreateClients from "./Clients/CreateClient";
import ManageClients from "./Clients/ManageClient";
import Dashboard from "./Dashboard";
import CreateInventory from "./Inventory/CreateInventory";
import ManageInventory from "./Inventory/ManageInventory";
import InvoiceHistory from "./Invoice/InvoiceHistory.jsx";
import OrderMenu from "./Orders/OrderMenu.jsx";
import CreatePatient from "./Patients/CreatePatient";
import ManagePatient from "./Patients/ManagePatient";
import CreateVeterinarian from "./Veterinarians/CreateVeterinarian";
import ManageVeterinarians from "./Veterinarians/ManageVeterinarian";

function Main() {
  const [sidebar, setSidebar] = useState(
    sessionStorage.getItem("sidebar") === "true" || window.innerWidth > 993
  );
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [setting, setSetting] = useState(false);
  const [dot, setDot] = useState(false);
  const [user, setUser] = useState({});
  const sidebarRef = useRef(null);
  const settingRef = useRef(null);
  const dotRef = useRef(null);
  const toast = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!username || !token) {
      navigate("/");
    } else {
      // const user = jwtDecode(token);
      setUser(username);
    }
    path();
  }, [username, token, navigate]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 993) {
        setSidebar(true);
      } else {
        setSidebar(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("sidebar", sidebar);
  }, [sidebar]);

  useEffect(() => {}, [user]);

  const path = () => {
    if (pathname === "/blue-bubbles" || pathname === "/blue-bubbles/") {
      navigate(-1);
    }
  };

  useClickOutside(sidebarRef, () => {
    if (window.innerWidth < 992) setSidebar(false);
  });

  useClickOutside(dotRef, () => {
    setDot(false);
  });

  useClickOutside(settingRef, () => {
    setSetting(false);
  });

  const handleSignOut = () => {
    confirmDialog({
      message: "Are you sure you want to logout?",
      header: "Confirm",
      icon: "pi pi-exclamation-triangle",
      position: "top",
      accept,
      reject,
    });
  };

  const accept = () => {
    localStorage.clear();
    navigate("/");
  };

  const reject = () => {
    toast.current.show({
      severity: "warn",
      summary: "Rejected",
      detail: "You have rejected",
      life: 2000,
    });
  };

  return (
    <div>
      <Toast ref={toast} />
      <div className="block-content">
        <div className="h-screen overflow-hidden">
          <div className="min-h-screen flex relative lg:static surface-ground hidden">
            <Sidebar
              sidebarRef={sidebarRef}
              settingRef={settingRef}
              sidebar={sidebar}
              setSidebar={setSidebar}
              setting={setting}
              handleSignOut={handleSignOut}
              setSetting={setSetting}
              avatar={avatar}
            />

            <div className="flex flex-column relative flex-auto">
              <Navbar
                dotRef={dotRef}
                setSidebar={setSidebar}
                sidebar={sidebar}
                setDot={setDot}
                dot={dot}
              />
              <div
                className="p-3 flex flex-column flex-auto overflow-auto"
                style={{ height: "calc(100vh - 60px)" }}
              >
                {pathname === "/blue-bubbles/dashboard" && <Dashboard />}
                {pathname === "/blue-bubbles/create-appointment" && (
                  <CreateAppointment />
                )}
                {pathname === "/blue-bubbles/manage-appointment" && (
                  <ManageAppointment />
                )}
                {pathname === "/blue-bubbles/create-patient" && (
                  <CreatePatient />
                )}
                {pathname === "/blue-bubbles/manage-patient" && (
                  <ManagePatient />
                )}
                {pathname === "/blue-bubbles/create-client" && (
                  <CreateClients />
                )}
                {pathname === "/blue-bubbles/manage-client" && (
                  <ManageClients />
                )}
                {pathname === "/blue-bubbles/create-veterinarian" && (
                  <CreateVeterinarian />
                )}
                {pathname === "/blue-bubbles/manage-veterinarian" && (
                  <ManageVeterinarians />
                )}
                {pathname === "/blue-bubbles/create-inventory" && (
                  <CreateInventory />
                )}
                {pathname === "/blue-bubbles/manage-inventory" && (
                  <ManageInventory />
                )}
                {pathname === "/blue-bubbles/product" && <OrderMenu />}
                {pathname === "/blue-bubbles/billing" && <Billing />}
                {pathname === "/blue-bubbles/invoice-history" && (
                  <InvoiceHistory />
                )}
              </div>
            </div>
            <ConfirmDialog />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
