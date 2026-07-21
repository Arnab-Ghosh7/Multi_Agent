from backend.agents.llm import call_llm

class BillingAgent:
    def __init__(self):
        self.name = "Billing Agent"
        self.system_prompt = (
            "You are the AuraGlow Electronics Billing Support Agent. "
            "Your job is to assist customers with invoices, billing discrepancies, subscription activations, and refund requests. "
            "Use the retrieved knowledge base document snippets below to provide accurate billing policies. "
            "Keep your tone polite, helpful, and highly professional. "
            "If the customer asks for a refund, explain the 30-day return window and the 10% restocking fee on premium items (e.g. Pro Projector)."
        )

    async def handle(self, query: str, context: str, chat_history=None) -> str:
        # Construct system prompt with context
        prompt_with_context = f"{self.system_prompt}\n\nRetrieved Knowledge Base Context:\n{context}"
        
        # Try calling real LLM
        response = await call_llm(prompt_with_context, query, chat_history)
        if response:
            return response
            
        # Fallback Mock Response (Intelligent rule-based)
        query_lower = query.lower()
        if "refund" in query_lower or "return" in query_lower:
            return (
                "Billing Agent: I can help you with your return or refund request! "
                "According to our Return Policy, customers can return AuraGlow hardware products within 30 days of the purchase date for a full refund. "
                "The items must be in their original packaging and in like-new condition. "
                "Please note that a 10% restocking fee applies to open-box returns of premium items (such as the AuraGlow Pro Projector). "
                "Digital downloads, software keys, and clearance items are non-refundable. "
                "To initiate this process, please email your order number to billing@auraglow.com or go to auraglow.com/returns."
            )
        elif "price" in query_lower or "pricing" in query_lower or "cost" in query_lower or "how much" in query_lower:
            return (
                "Billing Agent: I can assist with pricing inquiries! "
                "Our product pricing is as follows:\n"
                "- AuraGlow Pro Projector: $299.99\n"
                "- AuraGlow Beam Soundbar: $129.99\n"
                "- AuraGlow Ambient Light Strips: $39.99\n"
                "- AuraGlow Hub Controller: $79.99\n\n"
                "All hardware items come with a 1-year limited warranty. Let me know if you would like me to help you set up an order!"
            )
        elif "invoice" in query_lower or "charge" in query_lower or "bill" in query_lower:
            return (
                "Billing Agent: I understand you have a question about an invoice or charge on your account. "
                "I would be glad to check this for you. Please provide your Order Number or the Email Address associated with your account, "
                "and I will locate the transaction details immediately."
            )
        else:
            return (
                "Billing Agent: Thank you for reaching out to AuraGlow Billing Support. "
                "I am here to assist you with payment methods, subscription activation, invoices, and refund questions. "
                "Could you please provide more details or an order number so I can best assist you?"
            )
