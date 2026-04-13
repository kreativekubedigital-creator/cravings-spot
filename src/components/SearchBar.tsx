import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <div className="px-5 mb-5 lg:px-8">
    <div className="flex items-center gap-3 glass rounded-2xl px-4 py-3">
      <Search size={16} className="text-muted-foreground flex-shrink-0" />
      <input
        type="text"
        placeholder="Search food..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
      />
    </div>
  </div>
);

export default SearchBar;
