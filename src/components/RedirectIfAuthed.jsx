import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

// Wraps the public routes (landing, auth, forgot/reset password, otp). If a session token
// already exists — e.g. the person closed the tab and came back — skip straight to the
// dashboard instead of showing the marketing/login pages again.
const RedirectIfAuthed = () => {
    const token = Cookies.get("token");
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
};

export default RedirectIfAuthed;
