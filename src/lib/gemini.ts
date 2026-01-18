export async function generateResponse(userMessage: string, userId: string): Promise<string> {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "generateResponse", payload: { userMessage, userId } }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.response;
}

export async function generateFlashcards(topic: string, count: number = 5): Promise<{ front: string; back: string }[]> {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "generateFlashcards", payload: { topic, count } }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.response;
}