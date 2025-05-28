import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ConversationProvider,
  useConversation,
} from "#/context/conversation-context";
import { clearMessages, addUserMessage } from "#/state/chat-slice";
import { clearTerminal } from "#/state/command-slice";
import { useEffectOnce } from "#/hooks/use-effect-once";
import { clearJupyter } from "#/state/jupyter-slice";
import { ChatInterfaceOkteto } from "../components/features/chat/chat-interface-okteto";
import { WsClientProvider } from "#/context/ws-client-provider";
import { EventHandler } from "../wrapper/event-handler";
import { useConversationConfig } from "#/hooks/query/use-conversation-config";
import { useEndSession } from "#/hooks/use-end-session";
import { useUserConversation } from "#/hooks/query/use-user-conversation";
import { clearFiles, clearInitialPrompt } from "#/state/initial-query-slice";
import { RootState } from "#/store";
import { displayErrorToast } from "#/utils/custom-toast-handlers";
import { useDocumentTitleFromState } from "#/hooks/use-document-title-from-state";

function AppContent() {
  useConversationConfig();
  const { conversationId } = useConversation();
  const { data: conversation, isFetched } = useUserConversation(
    conversationId || null,
  );
  const { initialPrompt, files } = useSelector(
    (state: RootState) => state.initialQuery,
  );
  const dispatch = useDispatch();
  const endSession = useEndSession();

  // Set the document title to the conversation title when available
  useDocumentTitleFromState();

  React.useEffect(() => {
    if (isFetched && !conversation) {
      displayErrorToast(
        "This conversation does not exist, or you do not have permission to access it.",
      );
      endSession();
    }
  }, [conversation, isFetched]);

  React.useEffect(() => {
    dispatch(clearMessages());
    dispatch(clearTerminal());
    dispatch(clearJupyter());
    if (conversationId && (initialPrompt || files.length > 0)) {
      dispatch(
        addUserMessage({
          content: initialPrompt || "",
          imageUrls: files || [],
          timestamp: new Date().toISOString(),
          pending: true,
        }),
      );
      dispatch(clearInitialPrompt());
      dispatch(clearFiles());
    }
  }, [conversationId]);

  useEffectOnce(() => {
    dispatch(clearMessages());
    dispatch(clearTerminal());
    dispatch(clearJupyter());
  });

  function renderMain() {
    return (
      <div className="rounded-xl overflow-hidden w-full">
        <ChatInterfaceOkteto />
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
