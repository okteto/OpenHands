import React from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ConversationProvider,
  useConversation,
} from "#/context/conversation-context";
import { clearMessages, addUserMessage } from "#/state/chat-slice";
import { clearTerminal } from "#/state/command-slice";
import { useEffectOnce } from "#/hooks/use-effect-once";
import { clearJupyter } from "#/state/jupyter-slice";
import { ChatInterfaceOkteto } from "../../components/features/chat/chat-interface-okteto";
import { WsClientProvider } from "#/context/ws-client-provider";
import { EventHandler } from "./event-handler";
import { useConversationConfig } from "#/hooks/query/use-conversation-config";
import { useEndSession } from "#/hooks/use-end-session";
import { useUserConversation } from "#/hooks/query/use-user-conversation";
import { clearFiles, clearInitialPrompt } from "#/state/initial-query-slice";
import { RootState } from "#/store";

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

  React.useEffect(() => {
    if (isFetched && !conversation) {
      toast.error(
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

  return (
    <WsClientProvider conversationId={conversationId}>
      <EventHandler>
        <div data-testid="app-route" className="flex flex-col h-full">
          <div className="flex h-full">
            <div className="w-full">
              <ChatInterfaceOkteto />
            </div>
          </div>
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
