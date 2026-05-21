import { FiSearch } from "react-icons/fi";

const AdminFilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  resultText,
}) => {
  return (
    <section className="usuarios-toolbar">
      <div className="usuarios-search-box">
        <FiSearch />

        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {filters.map((filter) => (
        <select
          key={filter.name}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      <span>{resultText}</span>
    </section>
  );
};

export default AdminFilterBar;