export async function POST(req) {
    try {
      const { text } = await req.json()
  
      // In a real application, this would call an AI service like OpenAI
      // to extract structured data from natural language
  
      // For demo purposes, we'll use a simplified extraction logic
      const extractedData = extractInvoiceDetails(text)
  
      return Response.json({ success: true, data: extractedData })
    } catch (error) {
      console.error("Error extracting invoice details:", error)
      return Response.json({ success: false, error: "Failed to extract invoice details" }, { status: 500 })
    }
  }
  
  function extractInvoiceDetails(text) {
    // This is a simplified extraction logic
    // In a real app, you would use a more sophisticated NLP approach or AI model
  
    const amountMatch = text.match(/\$(\d+(\.\d+)?)|(\d+(\.\d+)?) dollars|(\d+) USD/i)
    const deadlineMatch = text.match(/(due by|deadline|by|due on|due) ([A-Za-z]+ \d+|\d+\/\d+\/\d+|\d+-\d+-\d+)/i)
  
    // Extract title and description
    let title = ""
    let description = ""
  
    if (text.length > 10) {
      // Simple heuristic: first sentence is title, rest is description
      const sentences = text.split(/[.!?]/)
      if (sentences.length > 0) {
        title = sentences[0].trim()
        description = sentences.slice(1).join(". ").trim()
      }
  
      // If title is too long, truncate it
      if (title.length > 50) {
        title = title.substring(0, 47) + "..."
      }
    }
  
    const result = {
      title: title || "",
      description: description || title || "",
      amount: amountMatch ? Number.parseFloat(amountMatch[1] || amountMatch[3] || amountMatch[5]) : null,
      deadline: deadlineMatch ? deadlineMatch[2] : null,
      isComplete: false,
    }
  
    // Check if we have all required fields
    result.isComplete = Boolean(result.title && result.amount && result.deadline)
  
    return result
  }
  