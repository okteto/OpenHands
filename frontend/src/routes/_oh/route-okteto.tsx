import React from "react";
import { useRouteError, isRouteErrorResponse, Outlet } from "react-router";
import i18n from "#/i18n";
import { useSettings } from "#/hooks/query/use-settings";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
        <pre>
          {error.data instanceof Object
            ? JSON.stringify(error.data)
            : error.data}
        </pre>
      </div>
    );
  }
  if (error instanceof Error) {
    return (
      <div>
        <h1>Uh oh, an error occurred!</h1>
        <pre>{error.message}</pre>
      </div>
    );
  }

  return (
    <div>
      <h1>Uh oh, an unknown error occurred!</h1>
    </div>
  );
}

export default function MainApp() {
  const { data: settings } = useSettings();

  React.useEffect(() => {
    if (settings?.LANGUAGE) {
      i18n.changeLanguage(settings.LANGUAGE);
    }
  }, [settings?.LANGUAGE]);

  return (
    <div
      data-testid="root-layout"
      className="bg-base h-screen overflow-x-hidden flex flex-col md:flex-row gap-3"
    >
      <div id="root-outlet" className="h-full w-full relative">
        <Outlet />
      </div>
    </div>
  );
}
