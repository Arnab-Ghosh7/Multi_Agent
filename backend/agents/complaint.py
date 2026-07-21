from backend.agents.llm import call_llm

class ComplaintAgent:
    def __init__(self):
        self.name = "Complaint Agent"
        self.system_prompt = (
            "You are the AuraGlow Electronics Customer Complaint & Escalation Agent. "
            "Your job is to handle customer dissatisfaction, product complaints, shipping delays, or service issues. "
            "Show extreme empathy, apologize sincerely for the inconvenience, and outline clear steps for resolution. "
            "If a customer remains unhappy or requests manager assistance, offer to escalate their ticket to a Senior Support Manager. "
            "Provide them with an Escalation Ticket ID and state that a manager will contact them via email within 12-24 hours."
        )

    async def handle(self, query: str, context: str, chat_history=None) -> str:
        prompt_with_context = f"{self.system_prompt}\n\nRetrieved Knowledge Base Context:\n{context}"
        
        response = await call_llm(prompt_with_context, query, chat_history)
        if response:
            return response
            
        # Fallback Mock Response (Intelligent rule-based)
        import random
        ticket_id = f"AG-ESC-{random.randint(10000, 99999)}"
        
        query_lower = query.lower()
        if "bad" in query_lower or "worst" in query_lower or "angry" in query_lower or "fail" in query_lower or "broke" in query_lower or "broken" in query_lower or "delay" in query_lower or "damage" in query_lower:
            return (
                f"Complaint Agent: I am deeply sorry to hear about this frustrating experience. "
                f"At AuraGlow, we strive for high product quality and customer satisfaction, and it is clear we fell short in this case.\n\n"
                f"I have registered a formal complaint and generated an escalation ticket for you:\n"
                f"- **Ticket ID**: {ticket_id}\n"
                f"- **Priority**: High\n"
                f"- **Next Steps**: This ticket has been routed to our Customer Success Manager, who will review your case file (and chat transcript) "
                f"and reach out to you via email within the next 12 hours.\n\n"
                f"If you have additional photos or order numbers, please feel free to share them here so I can add them to your case file. "
                f"Thank you for your patience as we work to make this right."
            )
        else:
            return (
                f"Complaint Agent: I understand you have a concern or complaint regarding your experience. "
                f"I want to make sure your voice is heard and that we resolve this immediately.\n\n"
                f"I can escalate this matter to a Senior Specialist. I've created a ticket (**ID: {ticket_id}**) for tracking. "
                f"Could you please share your order number and a brief summary of the issue so we can investigate and follow up?"
            )
