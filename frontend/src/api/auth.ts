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

export const getCurrentUser = async () => {
    const response = await api.get("/api/auth/me");
    return response.data.data;
};