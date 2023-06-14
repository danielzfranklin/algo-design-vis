const MARKER_COLORS = [
  ["text-teal-500", "bg-teal-100", "border-teal-300"],
  ["text-indigo-500", "bg-indigo-100", "border-indigo-300"],
  ["text-fuchsia-500", "bg-fuchsia-100", "border-fuchsia-300"],
  ["text-red-500", "bg-red-100", "border-red-300"],
];

export default function MarkedList({
  items,
  markers,
  compact,
}: {
  items: Array<string>;
  markers: Array<[number, string]>;
  compact?: boolean;
}) {
  return (
    <div className="inline-flex flex-row gap-4 font-mono">
      <ul className="inline-flex flex-row">
        {items.map((item, idx) => (
          <li key={idx} className="inline-flex flex-col">
            <span className="text-center mx-[2px]">{item}</span>
            {markers
              .map<[number, string, number]>(([i, label], idx) => [
                i,
                label,
                idx,
              ])
              .filter(([i]) => i === idx)
              .map(([_i, label, idx]) =>
                compact ? (
                  <span
                    key={label}
                    className={`mx-[2px] border-t-[2px] ${MARKER_COLORS[idx][2]}`}
                  />
                ) : (
                  <span
                    className={`text-xs tracking-tighter text-center ${MARKER_COLORS[idx][0]}`}
                    key={label}
                  >
                    {label}
                  </span>
                )
              )}
          </li>
        ))}
      </ul>

      <ul className="inline-flex flex-row gap-2 text-xs tracking-tighter text-gray-800 h-min">
        {markers.map(([i, label], idx) => (
          <li
            key={label}
            className={`px-2 py-1 rounded ${MARKER_COLORS[idx][1]}`}
          >
            {label} = {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
