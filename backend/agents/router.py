import re
import asyncio
from typing import List, Dict, Tuple
try:
    from backend.agents.billing import BillingAgent
    from backend.agents.technical import TechnicalSupportAgent
    from backend.agents.product import ProductAgent
    from backend.agents.complaint import ComplaintAgent
    from backend.agents.faq import FAQAgent
    from backend.agents.llm import call_llm
except ModuleNotFoundError:
    from agents.billing import BillingAgent
    from agents.technical import TechnicalSupportAgent
    from agents.product import ProductAgent
    from agents.complaint import ComplaintAgent
    from agents.faq import FAQAgent
    from agents.llm import call_llm

class AgentRouter:
    def __init__(self):
        self.agents = {
            "billing": BillingAgent(),
            "technical": TechnicalSupportAgent(),
            "product": ProductAgent(),
            "complaint": ComplaintAgent(),
            "faq": FAQAgent()
        }
        
    def detect_intent_rule_based(self, query: str) -> Dict[str, float]:
        """
        Determines the relevance scores for each agent based on keyword matches.
        Returns a dictionary of agent names and their confidence scores (0.0 to 1.0).
        """
        query_lower = query.lower()
        
        keywords = {
            "billing": [
                "billing", "refund", "return", "charge", "invoice", "payment", "paid", 
                "cost", "price", "pricing", "how much", "subscribe", "subscription", "buy", "purchase"
            ],
            "technical": [
                "wifi", "wi-fi", "network", "connect", "connection", "setup", "install", 
                "focus", "blurry", "image", "screen", "power", "turn on", "off", "error", 
                "bug", "reset", "password", "login", "update", "firmware", "software", "cable", "hdmi"
            ],
            "product": [
                "projector", "soundbar", "beam", "light strip", "led", "hub", "controller",
                "spec", "specification", "feature", "color", "compare", "catalog", "dimensions", "weight"
            ],
            "complaint": [
                "worst", "terrible", "angry", "dissatisfied", "disappointed", "manager", "escalate", 
                "broken", "broke", "delay", "late", "damage", "damaged", "fail", "useless", "scam"
            ],
            "faq": [
                "hours", "time", "contact", "email", "phone", "call", "address", "location", 
                "where", "shipping rates", "delivery time", "warranty period", "policy"
            ]
        }
        
        scores = {}
        for agent_name, words in keywords.items():
            matches = 0
            for w in words:
                # Use word boundaries or simple search
                if w in query_lower:
                    # Give higher weight to exact word matches
                    matches += 1.0 if re.search(r'\b' + re.escape(w) + r'\b', query_lower) else 0.5
            
            # Normalize score
            if matches > 0:
                # Logarithmic scaling so multiple matches increase score but tapers off
                scores[agent_name] = min(1.0, 0.4 + (0.2 * matches))
            else:
                scores[agent_name] = 0.0
                
        # Handle some context adjustments (e.g. if everything is 0, default to faq and product)
        if sum(scores.values()) == 0.0:
            scores["faq"] = 0.3
            scores["product"] = 0.2
            
        return scores

    async def detect_intent_llm(self, query: str) -> Dict[str, float]:
        """
        Uses LLM to detect agent routing scores.
        Falls back to rule-based if LLM fails or is not configured.
        """
        system_prompt = (
            "You are the central router for AuraGlow Electronics Support. "
            "Your task is to classify customer queries and route them to the appropriate specialized agents.\n"
            "The available agents are:\n"
            "1. billing (payments, subscription, refund, invoice, pricing)\n"
            "2. technical (wifi, focus, display, setup, installation, error, login)\n"
            "3. product (specifications, colors, features, product catalog details)\n"
            "4. complaint (manager escalations, severe product failure, shipping delay anger)\n"
            "5. faq (hours, contact details, general shipping rates, warranty scope)\n\n"
            "Respond ONLY with a JSON object where keys are agent names and values are confidence scores between 0.0 and 1.0.\n"
            "Example:\n"
            '{"billing": 0.9, "technical": 0.8, "product": 0.0, "complaint": 0.0, "faq": 0.0}'
        )
        
        response = await call_llm(system_prompt, f"Query to route: '{query}'")
        if response:
            try:
                # Extract JSON if returned with markdown blocks
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    scores = json.loads(json_match.group(0))
                    # Ensure all agents are present
                    result = {}
                    for agent in self.agents.keys():
                        result[agent] = float(scores.get(agent, 0.0))
                    return result
            except Exception as e:
                print(f"Failed to parse LLM intent routing response: {e}")
                
        # Fallback to rule-based
        return self.detect_intent_rule_based(query)

    async def route_and_process(self, query: str, rag_pipeline, chat_history=None) -> Dict:
        """
        Main entry point. Routes the query, retrieves RAG context, invokes agents, and aggregates response.
        """
        # 1. Detect Intent
        scores = await self.detect_intent_llm(query)
        
        # Filter agents with confidence >= 0.35
        active_agents = [agent for agent, score in scores.items() if score >= 0.35]
        if not active_agents:
            # Fallback to the single highest-scoring agent
            highest_agent = max(scores, key=scores.get)
            active_agents = [highest_agent]
            
        # 2. Retrieve Context & Process Agent Responses Concurrently
        agent_tasks = []
        sources = []
        
        for agent_name in active_agents:
            agent = self.agents[agent_name]
            
            # Map agent to knowledge base filters for focused retrieval
            doc_filter = None
            if agent_name == "billing":
                doc_filter = ["refund_policy", "products"]
            elif agent_name == "technical":
                doc_filter = ["user_manual"]
            elif agent_name == "product":
                doc_filter = ["products"]
            elif agent_name == "complaint":
                doc_filter = ["refund_policy", "warranty"]
            elif agent_name == "faq":
                doc_filter = ["faq", "shipping_policy", "warranty"]
                
            # Search relevant documents
            chunks = rag_pipeline.search(query, top_k=2, doc_filter=doc_filter)
            
            # Form context block for this agent
            context_block = ""
            for c in chunks:
                context_block += f"Source [{c['doc_name']}]: {c['text']}\n\n"
                # Keep track of sources for UI display
                sources.append({
                    "doc_name": c["doc_name"],
                    "text": c["text"],
                    "score": c["score"],
                    "agent": agent.name
                })
                
            # Create handler task
            agent_tasks.append(agent.handle(query, context_block, chat_history))
            
        # Execute active agents in parallel
        agent_responses = await asyncio.gather(*agent_tasks)
        
        # 3. Response Aggregator (Merge responses)
        merged_response = ""
        
        # If we have real LLM, let's ask it to merge the responses seamlessly
        api_key_configured = False
        from backend.database.database import get_all_settings
        settings = get_all_settings()
        if (settings.get("api_provider") == "gemini" and settings.get("gemini_api_key")) or \
           (settings.get("api_provider") == "openai" and settings.get("openai_api_key")):
            api_key_configured = True
            
        if api_key_configured and len(active_agents) > 1:
            drafts_str = ""
            for name, resp in zip(active_agents, agent_responses):
                drafts_str += f"[{self.agents[name].name} Draft]:\n{resp}\n\n"
                
            system_merge_prompt = (
                "You are the AuraGlow Customer Support Orchestrator. "
                "Below are responses drafted by our specialized department agents for the customer's query.\n"
                "Your job is to combine their answers into a single, cohesive, friendly, and non-redundant customer support response. "
                "Do NOT mention 'Drafts' or 'Specialized agents' to the customer. Act as a single helpful support agent. "
                "Synthesize the text naturally."
            )
            merge_query = f"Customer Query: {query}\n\nAgent Drafts:\n{drafts_str}"
            merged_response = await call_llm(system_merge_prompt, merge_query)
            
        # Fallback to smooth conversational formatting
        if not merged_response:
            if len(active_agents) == 1:
                merged_response = agent_responses[0]
            else:
                # Clean and combine responses naturally without repetitive headers
                cleaned_parts = []
                for name, resp in zip(active_agents, agent_responses):
                    # Remove agent name prefix if present
                    clean_text = resp.replace(f"{self.agents[name].name}:", "").strip()
                    cleaned_parts.append(clean_text)
                
                # Combine into a cohesive multi-agent answer
                merged_response = "\n\n".join(cleaned_parts)
                
        # Remove duplicate sources list based on text content
        unique_sources = []
        seen_texts = set()
        for src in sources:
            if src["text"] not in seen_texts:
                seen_texts.add(src["text"])
                unique_sources.append(src)

        return {
            "response": merged_response,
            "routing_scores": scores,
            "active_agents": [self.agents[a].name for a in active_agents],
            "sources": unique_sources
        }
