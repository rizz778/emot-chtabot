import { useState } from "react";

const CallForm = () => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    "Hello, this is your chatbot calling!"
  );

  const handleCall = async () => {
    const response = await fetch("http://127.0.0.1:5000/make_call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    });

    const data = await response.json();
    alert(data.message || data.error);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">
        Receive a Call from the Chatbot
      </h2>
      <input
        type="tel"
        placeholder="Enter your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        onClick={handleCall}
        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Call Me
      </button>
    </div>
  );
};

export default CallForm;
