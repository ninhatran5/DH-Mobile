const refreshToken = async (apiClient) => {
  try {
    const response = await apiClient.post("/refresh", {
        Token: localStorage.getItem("token"),
    });
    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}
export default refreshToken;