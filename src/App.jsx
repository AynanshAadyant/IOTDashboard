import { useEffect, useState } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch function
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://oajfq8w29b.execute-api.ap-south-1.amazonaws.com/default/messages");
      const data = await res.json();
      const parsed = JSON.parse(data.body);
      setMessages(parsed);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch on load + poll every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>📡 IoT Dashboard</h1>
      <h3>Data from ESP-01 via AWS IoT Core</h3>

      <button onClick={fetchData} style={{ padding: "8px 16px", marginBottom: "20px", cursor: "pointer" }}>
        🔄 Refresh Now
      </button>

      {loading ? (
        <p>Loading data...</p>
      ) : messages && messages.length ? (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Device ID</th>
              <th>Message</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg, index) => (
              <tr key={index}>
                <td>{msg.id}</td>
                <td>{msg.deviceId}</td>
                <td>{msg.message}</td>
                <td>{new Date(msg.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No messages received yet.</p>
      )}
    </div>
  );
}
