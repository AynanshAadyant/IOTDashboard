import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [rawMessages, setRawMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [iot_devices, setIot_devices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const GET_MESSAGES_API = "https://ye7scscfng.execute-api.us-east-1.amazonaws.com/default/Get_ESP32_data";
  const SEND_COMMAND_API = "https://i95n20ki31.execute-api.ap-south-1.amazonaws.com/prod/send_esp_data";

  // Fetch all device data from DynamoDB via Lambda
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(GET_MESSAGES_API);
      const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      console.log( data.telemetry );
      setRawMessages(data.telemetry );

      // Extract unique device IDs
      const uniqueDevices = [...new Set(data.telemetry.map((msg) => msg.deviceId))];
      setIot_devices(uniqueDevices);

      // Auto-select first device
      if (!deviceId && uniqueDevices.length) {
        setDeviceId(uniqueDevices[0]);
      }

      // Filter messages for currently selected device
      if (deviceId) {
        const filtered = data.filter((msg) => msg.deviceId === deviceId);
        setMessages(filtered);
      }

    } catch (err) {
      console.error("❌ Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter messages when device changes
  const getData = () => {
    const filtered = rawMessages.filter((msg) => msg.deviceId === deviceId);
    setMessages(filtered);
  };

  // Send command to the device
  const sendCommand = async () => {
    if (!command.trim() || !deviceId) {
      alert("⚠️ Device ID and Command are required");
      return;
    }
    console.log( command );
    setSending(true);
    try {
      const payload = {
        body : {
          deviceId: deviceId,
          command: command.trim()
        }
      }
      const res = await axios.post(
        SEND_COMMAND_API,
        {
          body : JSON.stringify( payload )
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("✅ Command sent:", res );
      alert("✅ Command sent successfully!");
      setCommand("");
    } catch (err) {
      console.error("❌ Error sending command:", err);
      alert("❌ Failed to send command");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    getData();
  }, [deviceId, rawMessages]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 font-sans">
      <h1 className="text-3xl font-bold text-center mb-8">🔧 IoT Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Message Viewer */}
        <div className="w-full md:w-1/2 border border-gray-300 rounded-lg p-6 bg-white shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📨 Device Messages</h2>
            <button
              onClick={fetchData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading messages...</p>
          ) : messages.length ? (
            <div className="max-h-[400px] overflow-y-auto flex flex-col gap-4">
              {messages.map((msg, idx) => {
                let parsedData = msg.sensor;
                try {
                  parsedData = JSON.parse(msg.sensor);
                } catch (e) {}

                return (
                  <div
                    key={idx}
                    className="p-3 border border-gray-200 bg-gray-100 rounded-lg"
                  >
                    <p><strong>Device:</strong> {msg.deviceId}</p>
                    <p><strong>Data: </strong> sensor : {JSON.stringify(parsedData, null, 2)}</p>
                    <p className="text-sm text-gray-600"><strong>Time:</strong> {msg.timestamp}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">No messages available.</p>
          )}
        </div>

        {/* Command Sender */}
        <div className="w-full md:w-1/2 border border-gray-300 rounded-lg p-6 bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">🛠️ Send Command</h2>

          <label className="block mb-1 font-medium">Select Device</label>
          <select
            className="w-full px-3 py-2 border rounded mb-4"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          >
            {iot_devices.map((id, idx) => (
              <option key={idx} value={id}>{id}</option>
            ))}
          </select>

          <label className="block mb-1 font-medium">Command</label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-4"
            placeholder='e.g. {"LED":"ON"}'
          />

          <button
            onClick={sendCommand}
            disabled={sending}
            className={`w-full py-2 px-4 text-white rounded ${sending ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
          >
            🚀 {sending ? "Sending..." : "Send Command"}
          </button>
        </div>
      </div>
    </div>
  );
}
