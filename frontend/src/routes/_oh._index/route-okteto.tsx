import React from "react";

import { TaskForm } from "#/components/shared/task-form";

function Home() {
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <div className="bg-base-secondary h-full rounded-xl flex flex-col items-center justify-center relative overflow-y-auto px-2">
      <div className="flex flex-col gap-8 w-full md:w-[600px] items-center">
        <div className="flex flex-col gap-2 w-full">
          <TaskForm ref={formRef} />
        </div>
      </div>
    </div>
  );
}

export default Home;
