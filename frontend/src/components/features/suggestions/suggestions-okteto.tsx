import { SuggestionItem, type Suggestion } from "./suggestion-item";

interface SuggestionsProps {
  suggestions: Suggestion[];
  onSuggestionClick: (value: string) => void;
}

export function SuggestionsOkteto({
  suggestions,
  onSuggestionClick,
}: SuggestionsProps) {
  return (
    <ul
      data-testid="suggestions"
      className="okteto-suggestions flex flex-col gap-4 w-full max-w-md"
    >
      {suggestions.map((suggestion, index) => (
        <SuggestionItem
          key={index}
          suggestion={suggestion}
          onClick={onSuggestionClick}
        />
      ))}
    </ul>
  );
}
