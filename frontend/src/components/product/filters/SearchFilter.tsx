import { Search } from "lucide-react";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

export function SearchFilter({ value, onChange, placeholder, label }: SearchFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search />
        </div>
      </div>
    </div>
  );
}