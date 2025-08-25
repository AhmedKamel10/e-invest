import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/users/user_profile").then((res) => setUser(res.data));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2>Profile</h2>
      <p>Username: {user.username}</p>
      <p>Balance: {user.balance}</p>
    </div>
  );
}
