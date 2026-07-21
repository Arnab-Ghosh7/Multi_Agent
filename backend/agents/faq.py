from backend.agents.llm import call_llm

class FAQAgent:
    def __init__(self):
        self.name = "FAQ Agent"
        self.system_prompt = (
            "You are the AuraGlow Electronics General FAQ Agent. "
            "Your job is to answer general inquiries about operating hours, contact info, shipping estimates, warranty coverage, and company locations. "
            "Use the retrieved knowledge base document snippets below to supply exact facts. "
            "Keep answers concise, direct, and helpful."
        )

    async def handle(self, query: str, context: str, chat_history=None) -> str:
        prompt_with_context = f"{self.system_prompt}\n\nRetrieved Knowledge Base Context:\n{context}"
        
        response = await call_llm(prompt_with_context, query, chat_history)
        if response:
            return response
            
        # Fallback Mock Response (Intelligent rule-based)
        query_lower = query.lower()
        if "hours" in query_lower or "time" in query_lower or "open" in query_lower:
            return (
                "FAQ Agent: Our support team is available Monday through Friday, 9:00 AM to 6:00 PM EST. "
                "Our AI Assistant is available right here to support you 24/7!"
            )
        elif "contact" in query_lower or "email" in query_lower or "phone" in query_lower or "call" in query_lower:
            return (
                "FAQ Agent: You can contact AuraGlow support through multiple channels:\n"
                "- **Email**: support@auraglow.com\n"
                "- **Phone**: 1-800-555-GLOW (1-800-555-4569)\n"
                "- **Chat**: Right here in this support window 24/7!"
            )
        elif "shipping" in query_lower or "deliver" in query_lower:
            return (
                "FAQ Agent: According to our Shipping Policy:\n"
                "- **Standard Shipping** (3-5 business days): Free for orders over $50, otherwise $4.99.\n"
                "- **Express Shipping** (1-2 business days): $14.99 flat rate.\n"
                "- **International Shipping** (7-14 business days): Calculated at checkout.\n"
                "Orders are processed within 24 hours on business days."
            )
        elif "warranty" in query_lower:
            return (
                "FAQ Agent: Yes, all AuraGlow hardware products come with a one-year (12 months) limited manufacturer warranty. "
                "This covers defects in materials and workmanship under normal, residential use. "
                "It does not cover accidental damage, liquid damage, or unauthorized repairs. To submit a claim, contact warranty@auraglow.com."
            )
        elif "where" in query_lower or "location" in query_lower or "address" in query_lower:
            return (
                "FAQ Agent: AuraGlow Electronics is headquartered in Sunnyvale, California. "
                "Our warehouse facilities are located in both California and Tennessee to ensure rapid delivery across the United States."
            )
        else:
            return (
                "FAQ Agent: I can help you with general questions about AuraGlow Electronics, including our store policies, "
                "shipping options, warranty coverages, and contact details. "
                "What general information can I help you find today?"
            )
        
        return response
