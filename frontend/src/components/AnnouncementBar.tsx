const messages = [
  "FREE SHIPPING ABOVE Rs.2000",
  "100% PREMIUM COTTON",
  "MADE WITH LOVE",
  "Express 3 Days Delivery",
];

const AnnouncementBar = () => (
  <div className="bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400 text-white text-center py-2.5 overflow-hidden">
    <div className="flex items-center justify-center gap-2 flex-wrap px-4 animate-slideIn">
      {messages.map((msg, i) => (
        <span 
          key={i} 
          className="text-[0.68rem] font-semibold tracking-[0.18em] uppercase flex items-center gap-2"
        >
          {i > 0 && (
            <span className="opacity-60 text-[8px] animate-pulse">✦</span>
          )}
          <span className="relative">
            {msg}
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white/40 transition-all duration-300 group-hover:w-full"></span>
          </span>
        </span>
      ))}
    </div>
  </div>
);

export default AnnouncementBar;

// Add this to your global CSS file or create a new style
const styles = `
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease forwards;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
`;