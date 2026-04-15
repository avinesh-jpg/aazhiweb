const messages = [
  "FREE SHIPPING ABOVE Rs.3000",
  "100% ORGANIC COTTON",
  "MADE WITH LOVE",
  "EASY 7-DAY RETURNS",
];

const AnnouncementBar = () => (
  <div className="bg-primary text-primary-foreground text-center py-2.5">
    <div className="flex items-center justify-center gap-2 flex-wrap px-4">
      {messages.map((msg, i) => (
        <span key={i} className="text-[0.68rem] font-semibold tracking-[0.18em] uppercase flex items-center gap-2">
          {i > 0 && <span className="opacity-40 text-[8px]">✦</span>}
          {msg}
        </span>
      ))}
    </div>
  </div>
);

export default AnnouncementBar;
