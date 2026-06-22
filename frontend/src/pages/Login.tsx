import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    return (
        <div>
            <h1>Job Tracker</h1>
            <GoogleLogin
                onSuccess={async (credentialResponse) => {
                    try {
                        const result = await loginWithGoogle(
                            credentialResponse.credential!
                        );
                        login(result.token, result.user);
                        navigate("/companies");
                    } catch (error) {
                        console.error("Login failed:", error);
                        alert("Authentication failed.");
                    }
                }}
                onError={() => {
                    alert("Login Failed");
                }}
            />
        </div>
    );
}