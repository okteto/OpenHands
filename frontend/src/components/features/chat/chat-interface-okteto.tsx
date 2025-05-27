import { useSelector } from "react-redux";
import React from "react";

import { RootState } from "#/store";
import { AgentState } from "#/types/agent-state";
import { useScrollToBottom } from "#/hooks/use-scroll-to-bottom";
import { useWsClient } from "#/context/ws-client-provider";
import { Messages } from "./messages";
import type { Message as MessageType } from "#/message";
import { LoadingSpinner } from "#/components/shared/loading-spinner";

export function ChatInterfaceOkteto() {
  const { isLoadingMessages } = useWsClient();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { onChatBodyScroll } = useScrollToBottom(scrollRef);

  const { messages } = useSelector((state: RootState) => state.chat);
  const { curAgentState } = useSelector((state: RootState) => state.agent);

  const emptyMessages: MessageType[] = [
    {
      sender: "assistant",
      content: "Welcome! How can I assist you today?",
      type: "thought",
      timestamp: new Date().toISOString(),
      pending: false,
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between">
      <div
        ref={scrollRef}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        className="flex flex-col grow overflow-y-auto overflow-x-hidden px-4 gap-2"
      >
        {messages.length === 0 && (
          <Messages
            messages={emptyMessages}
            isAwaitingUserConfirmation={false}
          />
        )}

        {isLoadingMessages && (
          <div className="flex justify-center">
            <LoadingSpinner size="small" />
          </div>
        )}

        {!isLoadingMessages && (
          <Messages
            messages={messages}
            isAwaitingUserConfirmation={
              curAgentState === AgentState.AWAITING_USER_CONFIRMATION
            }
          />
        )}
      </div>
    </div>
  );
}
