from backend.agents.llm import call_llm

class TechnicalSupportAgent:
    def __init__(self):
        self.name = "Technical Support Agent"
        self.system_prompt = (
            "You are the AuraGlow Electronics Technical Support Agent. "
            "Your job is to help customers troubleshoot hardware setup, network connections (Wi-Fi), firmware updates, and settings. "
            "Use the retrieved knowledge base document snippets (such as the User Manual) to guide the customer step-by-step. "
            "Ask clarifying questions if the issue is not clear, and keep your explanations simple and technical-yet-approachable."
        )

    async def handle(self, query: str, context: str, chat_history=None) -> str:
        prompt_with_context = f"{self.system_prompt}\n\nRetrieved Knowledge Base Context:\n{context}"
        
        response = await call_llm(prompt_with_context, query, chat_history)
        if response:
            return response
            
        # Fallback Mock Response (Intelligent rule-based)
        query_lower = query.lower()
        if "wifi" in query_lower or "wi-fi" in query_lower or "network" in query_lower or "internet" in query_lower:
            return (
                "Technical Support Agent: Let's get your AuraGlow device connected to Wi-Fi. Please follow these steps:\n"
                "1. Open the menu and go to Settings > Network > Wi-Fi.\n"
                "2. Choose your 2.4GHz or 5GHz wireless network from the list.\n"
                "3. Enter your Wi-Fi password and select connect. A green checkmark should appear once connected.\n\n"
                "If it fails to connect, please verify that your router is within range and restart both the router and the AuraGlow device. "
                "Are you getting a specific error code on the screen?"
            )
        elif "blurry" in query_lower or "focus" in query_lower or "clear" in query_lower:
            return (
                "Technical Support Agent: If the projector image is blurry, please try the following troubleshooting steps:\n"
                "- Rotate the Manual Focus Ring located near the lens until the image becomes sharp.\n"
                "- Ensure the projector lens is clean (use a microfiber cloth).\n"
                "- Make sure the projector is at least 1.5 meters (approx. 5 feet) away from the projection screen or wall.\n"
                "- Use the Keystone Correction slider on the side of the projector to adjust image skewing."
            )
        elif "no image" in query_lower or "black screen" in query_lower or "not turning on" in query_lower or "power" in query_lower:
            return (
                "Technical Support Agent: If you're experiencing power or display issues, let's check these items:\n"
                "- Ensure the power adapter is firmly connected to both the projector/device and a working wall outlet.\n"
                "- Confirm that you have removed the plastic protective lens cap from the front of the projector.\n"
                "- Verify that your input cable (HDMI) is securely plugged into both the projector and your source device (PC, console, etc.).\n"
                "- Press the Power button on the device itself rather than the remote to rule out remote battery issues. "
                "Does the power indicator LED light up, and if so, what color is it?"
            )
        elif "update" in query_lower or "firmware" in query_lower or "software" in query_lower:
            return (
                "Technical Support Agent: To update your system firmware:\n"
                "1. Ensure the device is connected to the internet.\n"
                "2. Go to Settings > System > Update.\n"
                "3. Click 'Check for Updates'. If an update is available, follow the on-screen instructions to download and install it. "
                "Keep the device powered on and plugged in during the process!"
            )
        else:
            return (
                "Technical Support Agent: Thank you for contacting AuraGlow Technical Support. "
                "I can assist you with setting up your projector, connecting to Wi-Fi, resolving audio/video issues, or downloading updates. "
                "Could you please tell me which AuraGlow device you are using, and describe the problem or any error messages you see?"
            )
