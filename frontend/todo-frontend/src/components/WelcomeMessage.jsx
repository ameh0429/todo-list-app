// src/components/WelcomeMessage.jsx
function WelcomeMessage() {
  const hour = new Date().getHours();
  let greeting = "";

  if (hour < 12) greeting = "Good morning ☀️ Ready to plan your day?";
  else if (hour < 18) greeting = "Good afternoon 🌤 Let’s keep the momentum!";
  else greeting = "Good evening 🌙 Time to wrap things up?";

  return <h2 className="text-xl font-semibold">{greeting}</h2>;
}

export default WelcomeMessage;