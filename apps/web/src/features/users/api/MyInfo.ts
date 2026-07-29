import axios from "axios";

export type MyInfoItem = {
  loginId: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  scrappedNewsIds?: string;
  favoriteStockTickers?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

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

export async function deleteMyAccount(): Promise<void> {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  await axios.delete(`${API_BASE_URL}/api/v1/users/me`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
