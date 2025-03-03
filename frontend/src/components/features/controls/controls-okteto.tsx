import React from "react";
import { AgentControlBar } from "./agent-control-bar";
import { AgentStatusBar } from "./agent-status-bar";
import { SecurityLock } from "./security-lock";

interface ControlsProps {
  setSecurityOpen: (isOpen: boolean) => void;
  showSecurityLock: boolean;
}

export function ControlsOkteto({
  setSecurityOpen,
  showSecurityLock,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-between p-4 border-t-1 border-neutral-1000">
      <div className="flex items-center gap-2">
        <AgentControlBar />
        <AgentStatusBar />

        {showSecurityLock && (
          <SecurityLock onClick={() => setSecurityOpen(true)} />
        )}
      </div>
    </div>
  );
}
