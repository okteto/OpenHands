import React from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import {
  ConversationProvider,
  useConversation,
} from "#/context/conversation-context";
import { clearTerminal } from "#/state/command-slice";
import { useEffectOnce } from "#/hooks/use-effect-once";
import { clearJupyter } from "#/state/jupyter-slice";

// import { ChatInterface } from "../components/features/chat/chat-interface";
import { ChatInterfaceOkteto as ChatInterface } from "../components/features/chat/chat-interface-okteto";
import { WsClientProvider } from "#/context/ws-client-provider";
import { EventHandler } from "../wrapper/event-handler";
import { useConversationConfig } from "#/hooks/query/use-conversation-config";
import { useUserConversation } from "#/hooks/query/use-user-conversation";
import { displayErrorToast } from "#/utils/custom-toast-handlers";
import { useDocumentTitleFromState } from "#/hooks/use-document-title-from-state";

function AppContent() {
  useConversationConfig();
  const { conversationId } = useConversation();
  const { data: conversation, isFetched } = useUserConversation(
    conversationId || null,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Set the document title to the conversation title when available
  useDocumentTitleFromState();

  React.useEffect(() => {
    if (isFetched && !conversation) {
      displayErrorToast(
        "This conversation does not exist, or you do not have permission to access it.",
      );
      navigate("/");
    }
  }, [conversation, isFetched]);

  React.useEffect(() => {
    dispatch(clearTerminal());
    dispatch(clearJupyter());
  }, [conversationId]);

  useEffectOnce(() => {
    dispatch(clearTerminal());
    dispatch(clearJupyter());
  });

  function renderMain() {
    return (
      <div className="rounded-xl overflow-hidden w-full">
        <ChatInterface />
      </div>
    );
  }

  return (
    <WsClientProvider conversationId={conversationId}>
      <EventHandler>
        <div data-testid="app-route" className="flex flex-col h-full gap-3">
          <div className="flex h-full overflow-auto">{renderMain()}</div>
        </div>
      </EventHandler>
    </WsClientProvider>
  );
}

function App() {
  return (
    <ConversationProvider>
      <AppContent />
    </ConversationProvider>
  );
}

export default App;
