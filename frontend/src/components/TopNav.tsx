import { NavLink } from "react-router-dom";

export function TopNav() {
  return (
    <nav className="topnav" aria-label="Главная навигация">
      <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/">
        Главная
      </NavLink>
      <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/calendar">
        Календарь
      </NavLink>
    </nav>
  );
}
