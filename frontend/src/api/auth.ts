import api from "./api";

export const loginWithGoogle =
    async (
        idToken: string
    ) => {

        const response =
            await api.post(
                "/api/auth/google-login",
                {
                    idToken,
                }
            );

        return response.data.data;
    };