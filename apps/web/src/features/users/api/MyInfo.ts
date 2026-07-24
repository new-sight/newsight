import axios from "axios";

export type MyInfoItem = {
  loginId: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
};

// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_BASE_URL = "http://localhost:8080";

export async function fetchMyInfo(username?: string): Promise<MyInfoItem> {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  const response = await axios.get<MyInfoItem>(
    `${API_BASE_URL}/api/v1/users/myInfo`,
    {
      params: username ? { username } : {},
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
  );

  return response.data;
}
