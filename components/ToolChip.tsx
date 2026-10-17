import type { Tool } from "@/lib/tools";

// Near-black brand colours (Vercel, GitHub, Notion, ...) vanish on the dark theme; lift them to white.
function visible(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum < 60 ? "#F4F4F5" : hex;
}

export function ToolMark({ tool, size = 16 }: { tool: Tool; size?: number }) {
  const color = visible(tool.color);
  if (tool.icon) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden className="shrink-0">
        <path d={tool.icon.path} />
      </svg>
    );
  }
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-[5px] font-mono font-bold leading-none"
      style={{
        width: size,
        height: size,
        fontSize: size * (tool.mono!.length > 2 ? 0.36 : tool.mono!.length > 1 ? 0.46 : 0.62),
        color,
        background: `${color}22`,
        boxShadow: `inset 0 0 0 1px ${color}55`,
      }}
    >
      {tool.mono}
    </span>
  );
}

export function ToolChip({ tool }: { tool: Tool }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
      <ToolMark tool={tool} />
      <span className="whitespace-nowrap text-sm font-medium tracking-tight text-white/85">{tool.name}</span>
    </span>
  );
}
