import os
os.environ["GOOGLE_API_KEY"] = "dummy"

from copilotkit import CopilotKitSDK, LangGraphAGUIAgent
from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")

def node(state: MessagesState):
    return {"messages": [llm.invoke(state["messages"])]}

g = StateGraph(MessagesState)
g.add_node("n", node)
g.add_edge(START, "n")
g.add_edge("n", END)
cg = g.compile()

agent = LangGraphAGUIAgent(name="agent", description="desc", graph=cg)
sdk = CopilotKitSDK(agents=[agent])
print("Success")
