import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Transfers() {
  const [transactions, setTransactions] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const fetchTransactions = () => {
    api.get("/transfers/my_transactions").then((res) => setTransactions(res.data));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSend = async () => {
    await api.post("/transfers", { recipient, amount });
    fetchTransactions();
  };

  const handleDelete = async (id) => {
    await api.post("/transfers/delete_transaction", id);
    fetchTransactions();
  };

  return (
    <div>
      <h2>My Transfers</h2>
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.recipient} - {t.amount}{" "}
            <button onClick={() => handleDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Recipient"
        />
        <input
          value={amount}
          type="number"
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
