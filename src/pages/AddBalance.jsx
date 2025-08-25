import { useState } from "react";
import api from "../api/axios";

export default function AddBalance() {
  const [amount, setAmount] = useState("");

  const handleAdd = async () => {
    await api.post("/users/add_balance", parseFloat(amount));
    alert("Balance updated");
  };

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <button onClick={handleAdd}>Add Balance</button>
    </div>
  );
}
