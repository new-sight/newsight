export type MyInfoItem = {
  email: string;
  name: string;
  loginId: string;
  username: string;
  role: string;
  createdAt: string;
  phone: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function fetchMyInfo(): Promise<MyInfoItem> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/myInfo`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch my info");
  }
  const data = (await response.json()) as MyInfoItem;
  return data;
}
