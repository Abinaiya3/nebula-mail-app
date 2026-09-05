from fastapi import APIRouter
from copilotkit import CopilotKitSDK, LangGraphAGUIAgent
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_core.messages import SystemMessage
import os

router = APIRouter()

def get_agent():
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", api_key=os.environ.get("GOOGLE_API_KEY"))

    def chatbot_node(state: MessagesState):
        messages = state["messages"]
        if not messages or not isinstance(messages[0], SystemMessage):
            messages = [SystemMessage(content="You are a helpful AI mail assistant. You can control the UI and perform actions using the provided tools.")] + messages
        
        response = llm.invoke(messages)
        return {"messages": [response]}

    graph = StateGraph(MessagesState)
    graph.add_node("chatbot", chatbot_node)
    graph.add_edge(START, "chatbot")
    graph.add_edge("chatbot", END)
    app_graph = graph.compile()

    return LangGraphAGUIAgent(name="default", description="Mail Assistant", graph=app_graph)

sdk = CopilotKitSDK(agents=[get_agent()])
