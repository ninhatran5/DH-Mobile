const refreshToken = async (apiClient) => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.post("/refresh", {
      Token: token,
    });

    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};
export default refreshToken;
