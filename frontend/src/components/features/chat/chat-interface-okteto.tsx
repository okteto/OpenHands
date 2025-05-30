import { useSelector } from "react-redux";
import React from "react";
import { useTranslation } from "react-i18next";
import { RootState } from "#/store";
import { AgentState } from "#/types/agent-state";
import { useScrollToBottom } from "#/hooks/use-scroll-to-bottom";
import { useWsClient } from "#/context/ws-client-provider";
import { Messages } from "./messages";

import { ScrollToBottomButton } from "#/components/shared/buttons/scroll-to-bottom-button";
import { LoadingSpinner } from "#/components/shared/loading-spinner";
import { useWSErrorMessage } from "#/hooks/use-ws-error-message";
import i18n from "#/i18n";
import { ErrorMessageBanner } from "./error-message-banner";
import { shouldRenderEvent } from "./event-content-helpers/should-render-event";
import { OpenHandsAction } from "#/types/core/actions";
import { OpenHandsObservation } from "#/types/core/observations";

export function ChatInterfaceOkteto() {
  const { getErrorMessage } = useWSErrorMessage();
  const { isLoadingMessages, parsedEvents } = useWsClient();
  const { t } = useTranslation();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollDomToBottom, onChatBodyScroll, hitBottom } =
    useScrollToBottom(scrollRef);

  const { curAgentState } = useSelector((state: RootState) => state.agent);

  const errorMessage = getErrorMessage();

  const events = parsedEvents.filter(shouldRenderEvent);

  const emptyEvents: (OpenHandsAction | OpenHandsObservation)[] = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      source: "agent",
      message: "Welcome! How can I assist you today?",
      action: "message",
      args: {
        thought: "Welcome! How can I assist you today?",
        image_urls: [],
        wait_for_response: true,
      },
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between">
      <div
        ref={scrollRef}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        className="scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-track-gray-800 hover:scrollbar-thumb-gray-300 flex flex-col grow overflow-y-auto overflow-x-hidden px-4 pt-4 gap-2 fast-smooth-scroll"
      >
        {events.length === 0 && (
          <Messages messages={emptyEvents} isAwaitingUserConfirmation={false} />
        )}

        {isLoadingMessages && (
          <div className="flex justify-center">
            <LoadingSpinner size="small" />
          </div>
        )}

        {!isLoadingMessages && (
          <Messages
            messages={events}
            isAwaitingUserConfirmation={
              curAgentState === AgentState.AWAITING_USER_CONFIRMATION
            }
          />
        )}
      </div>

      <div className="flex flex-col gap-[6px] px-4 pb-4">
        <div className="flex justify-between relative">
          {!hitBottom && <ScrollToBottomButton onClick={scrollDomToBottom} />}
        </div>

        {errorMessage && (
          <ErrorMessageBanner
            message={i18n.exists(errorMessage) ? t(errorMessage) : errorMessage}
          />
        )}
      </div>
    </div>
  );
}
