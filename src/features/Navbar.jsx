import React from "react";

function Navbar({ dotRef, setSidebar, sidebar, setDot, dot }) {
  return (
    <div
      ref={dotRef}
      className="flex justify-content-between align-items-center px-5 surface-section shadow-2 relative lg:static border-bottom-1 surface-border"
      style={{ height: "60px" }}
    >
      <div className="flex">
        <a
          onClick={() => setSidebar(!sidebar)}
          className="p-ripple cursor-pointer block  text-700 mr-3"
        >
          <i className="pi pi-bars text-4xl"></i>
          <span role="presentation" className="p-ink"></span>
        </a>
      </div>
    </div>
  );
}

export default Navbar;
