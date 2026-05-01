import { Context } from "@netlify/functions";

const SYSTEM_PROMPT = `You are PeePaw's AI sales intelligence engine — sharp, confident, and slightly witty.
You help a web design, graphic design, and marketing agency identify and close leads.
Your analysis is direct, actionable, and sales-focused. No fluff. No filler.
Always end with a clear recommendation.`;

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { groqApiKey, groqModel, ...data } = body;
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (!groqApiKey) {
      return new Response(JSON.stringify({ error: "Groq API Key is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const model = groqModel || "llama-3.3-70b-versatile"; // Default to Llama 3.3 70B as the best available model
    let prompt = "";

    if (path === "analyze") {
      prompt = `Analyze this business as a potential client for our web design, graphic design, and marketing agency.

Business: ${data.name}
Category: ${data.category || "N/A"}
Niche: ${data.niche || "custom"}
Address: ${data.address || "N/A"}
Website: ${data.website || "NO WEBSITE DETECTED"}
Rating: ${data.rating || "N/A"} (${data.review_count || 0} reviews)
Lead Score: ${data.lead_score || "N/A"}/5
Likelihood to Close: ${data.likelihood || "N/A"}

Provide a structured analysis in exactly this JSON format:
{
  "business_overview": "2-3 sentence overview of what this business does and their current digital presence",
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "services_to_sell": ["service 1 with why", "service 2 with why", "service 3 with why"],
  "one_liner": "One punchy sentence summarizing why we should pitch them"
}

Be specific to their niche. Be confident. Be concise.`;
    } else if (path === "email") {
      const opportunity = !data.has_website ? "no website at all" : `a website that scores ${data.website_score || "N/A"}/5`;
      prompt = `Write a personalized cold email to ${data.name} — a ${data.niche || "custom"} business.

They have ${opportunity}.
Rating: ${data.rating || "N/A"} stars.

Requirements:
- Subject line included
- 3-4 short paragraphs
- Conversational but professional
- Specific to their situation
- Clear call to action
- Slightly witty but not cringe
- Sign off as "The PeePaw Team"

Format:
SUBJECT: [subject line]

[email body]`;
    } else if (path === "script") {
      const situation = !data.has_website ? "they have no website" : `their website scores ${data.website_score || "N/A"}/5`;
      prompt = `Write a cold call script for calling ${data.name} — a ${data.niche || "custom"} business.

Situation: ${situation}
Rating: ${data.rating || "N/A"} stars

Format the script with:
- OPENER (first 10 seconds)
- HOOK (why you're calling)
- PAIN POINT (what problem you solve)
- PITCH (what you offer)
- OBJECTION HANDLERS (2-3 common ones)
- CLOSE (ask for the meeting)

Keep it natural, confident, and under 2 minutes when read aloud.
Label each section clearly.`;
    } else if (path === "pitch-package") {
      // For pitch-package, we'll just return a combined prompt for simplicity in a single function call
      // or we could do multiple calls, but let's keep it simple for now.
      prompt = `Generate a full pitch package for ${data.name} (${data.niche || "custom"}).
Include:
1. A cold email pitch (with subject)
2. A cold call script
3. 3 service bundle packages (name, services, value_prop)

Format as JSON:
{
  "email": "...",
  "call_script": "...",
  "service_bundles": [{"name": "...", "services": ["..."], "value_prop": "..."}]
}`;
    } else {
      return new Response("Not Found", { status: 404 });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: (path === "analyze" || path === "pitch-package") ? { type: "json_object" } : undefined,
        temperature: 0.7,
      }),
    });

    const groqData = await groqResponse.json();
    if (!groqResponse.ok) {
      return new Response(JSON.stringify(groqData), {
        status: groqResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const content = groqData.choices[0].message.content;
    const result = (path === "analyze" || path === "pitch-package") ? JSON.parse(content) : { [path]: content };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
