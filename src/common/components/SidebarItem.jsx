import React from "react";
import { useNavigate } from "react-router-dom";

function SidebarItem({ title, pathname, link, icon, border, onClick }) {
  const navigate = useNavigate();

  const OnClick = () => {
    if (onClick) {
      navigate(link);
      onClick();
    } else {
      navigate(link);
    }
  };
  return (
    <li className={border}>
      <a
        onClick={() => OnClick()}
        className={`${
          pathname === link
            ? "bg-white text-bluegray-800 pointer-events-none"
            : ""
        } p-ripple flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors w-full`}
      >
        <i className={`${icon} mr-2`}></i>
        <span className="font-medium">{title}</span>
        <span role="presentation" className="p-ink"></span>
      </a>
    </li>
  );
}
export default SidebarItem;
