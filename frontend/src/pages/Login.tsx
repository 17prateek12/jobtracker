import { GoogleLogin }
from "@react-oauth/google";

import { useNavigate }
from "react-router-dom";

import {
    loginWithGoogle,
} from "../api/auth";

export default function Login() {

    const navigate =
        useNavigate();

    return (

        <div>

            <h1>
                Job Tracker
            </h1>

            <GoogleLogin

                onSuccess={
                    async (
                        credentialResponse
                    ) => {

                        const result =
                            await loginWithGoogle(
                                credentialResponse
                                    .credential!
                            );

                        localStorage.setItem(
                            "token",
                            result.token
                        );

                        localStorage.setItem(
                            "user",
                            JSON.stringify(
                                result.user
                            )
                        );

                        navigate(
                            "/companies"
                        );
                    }
                }

                onError={() => {
                    alert(
                        "Login Failed"
                    );
                }}
            />

        </div>
    );
}