import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../../features/Login";
import Main from "../../features/Main";
import NotFound from "../../features/NotFound";

export default function RoutePages() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/blue-bubbles" element={<Main />} />
        <Route path="/blue-bubbles/login" element={<Login />} />
        <Route path="/blue-bubbles/dashboard" element={<Main />} />
        <Route path="/blue-bubbles/create-appointment" element={<Main />} />
        <Route path="/blue-bubbles/manage-appointment" element={<Main />} />
        <Route path="/blue-bubbles/create-patient" element={<Main />} />
        <Route path="/blue-bubbles/manage-patient" element={<Main />} />
        <Route path="/blue-bubbles/create-client" element={<Main />} />
        <Route path="/blue-bubbles/manage-client" element={<Main />} />
        <Route path="/blue-bubbles/veterinarians" element={<Main />} />
        <Route path="/blue-bubbles/create-veterinarian" element={<Main />} />
        <Route path="/blue-bubbles/manage-veterinarian" element={<Main />} />
        <Route path="/blue-bubbles/create-inventory" element={<Main />} />
        <Route path="/blue-bubbles/manage-inventory" element={<Main />} />
        <Route path="/blue-bubbles/product" element={<Main />} />
        <Route path="/blue-bubbles/billing" element={<Main />} />
        <Route path="/blue-bubbles/invoice-history" element={<Main />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
