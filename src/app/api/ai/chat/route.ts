import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, resourceId, context } = await req.json();

    if (!message || !resourceId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Mock an expensive LLM RAG inference delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simple heuristic to mock natural language extraction from the "PDF Context"
    let aiResponse = "";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("summary") || lowerMsg.includes("summarize")) {
      aiResponse = `Based on the document context, this material provides a robust overview of ${context.subject} algorithms, specifically diving into ${context.tags?.join(", ")}. It is tailored for ${context.difficulty} learners.`;
    } else if (lowerMsg.includes("explain")) {
      aiResponse = `Sure! Let me simplify that. Imagine you are trying to organize a library. The concepts in this textbook discuss how to do that natively without relying on heavy iterative loops, heavily optimizing computing limits. Does that analogy help?`;
    } else {
      aiResponse = `I've analyzed the text. Regarding "${message}", the paper explicitly mentions that optimization parameters must be dynamically adjusted. I recommend cross-referencing chapter 4 for deeper proofs.`;
    }

    return NextResponse.json({ 
      success: true, 
      response: aiResponse 
    });

  } catch (error) {
    return NextResponse.json({ error: "RAG Pipeline failure." }, { status: 500 });
  }
}
