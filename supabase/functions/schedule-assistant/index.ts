// Edge function: parse a natural-language scheduling request via Lovable AI
// and return suggested time slots that don't conflict with the user's events.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EventRow {
  starts_at: string;
  ends_at: string;
}

interface Intent {
  title: string;
  duration_minutes: number;
  preferred_window: "morning" | "afternoon" | "evening" | "any";
  earliest_iso: string | null;
  latest_iso: string | null;
  reasoning: string;
}

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function extractIntent(message: string, nowIso: string): Promise<Intent> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  const body = {
    model: "google/gemini-3-flash-preview",
    messages: [
      {
        role: "system",
        content: `You are a scheduling intent extractor. Current time is ${nowIso}.
Extract structured scheduling info from the user's message. If something isn't specified,
make sensible defaults (default duration 30 minutes, preferred_window "any", search the next 7 days).
Always return data via the tool call.`,
      },
      { role: "user", content: message },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "extract_scheduling_intent",
          description: "Extract structured scheduling intent from natural language",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Short event title, e.g. 'Meeting with Alex'" },
              duration_minutes: { type: "number" },
              preferred_window: {
                type: "string",
                enum: ["morning", "afternoon", "evening", "any"],
              },
              earliest_iso: {
                type: "string",
                description: "Earliest start date-time ISO; null if unspecified",
              },
              latest_iso: {
                type: "string",
                description: "Latest start date-time ISO; null if unspecified",
              },
              reasoning: { type: "string", description: "Brief friendly explanation to the user" },
            },
            required: ["title", "duration_minutes", "preferred_window", "reasoning"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "extract_scheduling_intent" } },
  };

  const resp = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI gateway error ${resp.status}: ${t}`);
  }

  const data = await resp.json();
  const call = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("No tool call in AI response");
  const args = JSON.parse(call.function.arguments);
  return {
    title: args.title,
    duration_minutes: args.duration_minutes ?? 30,
    preferred_window: args.preferred_window ?? "any",
    earliest_iso: args.earliest_iso ?? null,
    latest_iso: args.latest_iso ?? null,
    reasoning: args.reasoning ?? "",
  };
}

function windowHours(w: Intent["preferred_window"]): [number, number] {
  switch (w) {
    case "morning":
      return [9, 12];
    case "afternoon":
      return [13, 17];
    case "evening":
      return [17, 20];
    default:
      return [9, 18];
  }
}

function generateSlots(
  intent: Intent,
  events: EventRow[],
  now: Date,
): { start: string; end: string; reason: string }[] {
  const earliest = intent.earliest_iso ? new Date(intent.earliest_iso) : now;
  const latest = intent.latest_iso
    ? new Date(intent.latest_iso)
    : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const [startH, endH] = windowHours(intent.preferred_window);
  const durationMs = intent.duration_minutes * 60_000;

  const conflicts = events.map((e) => ({
    s: new Date(e.starts_at).getTime(),
    e: new Date(e.ends_at).getTime(),
  }));

  // Lunch buffer 12:00 - 13:00 considered busy
  const slots: { start: string; end: string; reason: string }[] = [];

  for (let day = 0; day < 7 && slots.length < 5; day++) {
    const dayStart = new Date(earliest);
    dayStart.setDate(earliest.getDate() + day);
    dayStart.setHours(startH, 0, 0, 0);
    if (dayStart < now) dayStart.setTime(Math.max(dayStart.getTime(), now.getTime()));
    if (dayStart > latest) break;

    // Try 30-min increments
    for (let h = dayStart.getHours(); h < endH && slots.length < 5; h++) {
      for (const m of [0, 30]) {
        const s = new Date(dayStart);
        s.setHours(h, m, 0, 0);
        if (s < now) continue;
        if (s > latest) break;
        const e = new Date(s.getTime() + durationMs);
        if (e.getHours() > endH || (e.getHours() === endH && e.getMinutes() > 0)) continue;

        // skip lunch overlap
        const lunchStart = new Date(s);
        lunchStart.setHours(12, 0, 0, 0);
        const lunchEnd = new Date(s);
        lunchEnd.setHours(13, 0, 0, 0);
        if (s < lunchEnd && e > lunchStart) continue;

        const conflict = conflicts.some(
          (c) => s.getTime() < c.e && e.getTime() > c.s,
        );
        if (conflict) continue;

        const reasons: string[] = [];
        if (h >= 9 && h < 11) reasons.push("Peak focus window");
        else if (h >= 14 && h < 16) reasons.push("Quiet afternoon block");
        else reasons.push("Calendar clear");

        slots.push({ start: s.toISOString(), end: e.toISOString(), reason: reasons[0] });
        if (slots.length >= 5) break;
      }
    }
  }

  return slots;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, events } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const intent = await extractIntent(message, now.toISOString());
    const safeEvents: EventRow[] = Array.isArray(events) ? events : [];
    const suggestions = generateSlots(intent, safeEvents, now);

    return new Response(
      JSON.stringify({ intent, suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("schedule-assistant error", msg);
    const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
