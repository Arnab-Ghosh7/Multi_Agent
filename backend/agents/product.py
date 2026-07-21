from backend.agents.llm import call_llm

class ProductAgent:
    def __init__(self):
        self.name = "Product Agent"
        self.system_prompt = (
            "You are the AuraGlow Electronics Product Expert Agent. "
            "Your job is to provide detailed information about AuraGlow products, including specifications, colors, features, comparisons, and usage scenarios. "
            "Use the product catalog and pricing sheets in the knowledge base to answer queries. "
            "Help the customer choose the right product based on their needs, and highlight key selling points (e.g. 4K UHD projector, smart app integration, Dolby Atmos soundbar)."
        )

    async def handle(self, query: str, context: str, chat_history=None) -> str:
        prompt_with_context = f"{self.system_prompt}\n\nRetrieved Knowledge Base Context:\n{context}"
        
        response = await call_llm(prompt_with_context, query, chat_history)
        if response:
            return response
            
        # Fallback Mock Response (Intelligent rule-based)
        query_lower = query.lower()
        if "projector" in query_lower:
            return (
                "Product Agent: The **AuraGlow Pro Projector** is one of our flagship products! Here are the key specifications:\n"
                "- **Price**: $299.99\n"
                "- **Resolution**: Smart 4K UHD Home Theater Projector.\n"
                "- **Brightness**: 3000 lumens (great for both day and night use).\n"
                "- **Features**: Built-in streaming apps, HDR10, dual-band Wi-Fi, Bluetooth 5.0, and adjustable screen sizes up to 150 inches!\n"
                "- **Color**: Pearl White.\n\n"
                "It's a complete cinema experience in a sleek design. Let me know if you have specific setup or feature questions about it!"
            )
        elif "soundbar" in query_lower or "beam" in query_lower or "audio" in query_lower or "speaker" in query_lower:
            return (
                "Product Agent: The **AuraGlow Beam Soundbar** is designed to pair perfectly with your home system. Features include:\n"
                "- **Price**: $129.99\n"
                "- **Audio Quality**: Dolby Atmos support with deep bass subwoofers.\n"
                "- **Connectivity**: HDMI ARC (for simple TV integration), optical input, and Bluetooth.\n"
                "- **Power Output**: 100W of premium surround sound.\n"
                "- **Color**: Charcoal Black.\n\n"
                "It connects seamlessly to the AuraGlow Pro Projector or standard smart TVs. Would you like to know more about the input options?"
            )
        elif "light" in query_lower or "led" in query_lower or "ambient" in query_lower or "strip" in query_lower:
            return (
                "Product Agent: Our **AuraGlow Ambient Light Strips** are a popular accessory for immersive setups:\n"
                "- **Price**: $39.99\n"
                "- **Length**: 10 meters (32.8 feet).\n"
                "- **Features**: Smart RGBIC colors (can display multiple colors simultaneously), syncs with TV/projector audio, and supports Google Home / Alexa app control.\n"
                "It's perfect for mounting behind TVs, projector screens, or along walls to create dynamic bias lighting."
            )
        elif "hub" in query_lower or "controller" in query_lower:
            return (
                "Product Agent: The **AuraGlow Hub Controller** ($79.99) is our smart home control center. "
                "It features a 5-inch touch screen, built-in battery backup, and supports Zigbee 3.0 and Wi-Fi. "
                "You can use it to synchronize all your AuraGlow devices, control volume, switch display sources, and manage smart home automations."
            )
        else:
            return (
                "Product Agent: Welcome to AuraGlow Products information! We offer a range of smart home theater devices, including:\n"
                "1. **AuraGlow Pro Projector** ($299.99) - 4K UHD Smart Projector\n"
                "2. **AuraGlow Beam Soundbar** ($129.99) - Dolby Atmos TV Soundbar\n"
                "3. **AuraGlow Ambient Light Strips** ($39.99) - RGBIC LED Music-Syncing strips\n"
                "4. **AuraGlow Hub Controller** ($79.99) - Smart Home Zigbee Console\n\n"
                "Which product or specification can I help you learn more about today?"
            )
        
        return response
