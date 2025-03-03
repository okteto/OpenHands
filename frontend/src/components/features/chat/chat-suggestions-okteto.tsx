import { SuggestionsOkteto } from "#/components/features/suggestions/suggestions-okteto";
import { SUGGESTIONS } from "#/utils/suggestions";

interface ChatSuggestionsProps {
  onSuggestionsClick: (value: string) => void;
}

export function ChatSuggestionsOkteto({
  onSuggestionsClick,
}: ChatSuggestionsProps) {
  return (
    <div className="flex flex-col h-full px-4 items-center justify-center">
      <SuggestionsOkteto
        suggestions={Object.entries(SUGGESTIONS.repo)
          .slice(0, 4)
          .map(([label, value]) => ({
            label,
            value,
          }))}
        onSuggestionClick={onSuggestionsClick}
      />
    </div>
  );
}
