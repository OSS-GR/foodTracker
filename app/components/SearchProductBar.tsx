import React, { useState } from "react";
import { SearchBar } from "react-native-elements";

interface SearchProductBarProps {
    onSearch?: (query: string) => void;
}

const SearchProductBar: React.FC<SearchProductBarProps> = ({ onSearch }) => {
    const [search, setSearch] = useState("");

    const handleChange = (text: string) => {
        setSearch(text);
        if (onSearch) {
            onSearch(text);
        }
    };

    return (
        <SearchBar 
            platform={"default"} 
            autoCorrect={false} 
            lightTheme={true} 
            showLoading={false} 
            showCancel={true} 
            searchIcon={{ name: "search" }}
            clearIcon={{ name: "clear" }}
            cancelIcon={{ name: "close" }}
            value={search}
            onChangeText={handleChange as any}
            placeholder="Search for a product..."
            loadingProps={{}}
            round={false}
            onClear={() => setSearch("")}
            onCancel={() => setSearch("")}
            onFocus={() => {}}
            onBlur={() => {}}
            cancelButtonTitle="Cancel"
            cancelButtonProps={{}}
        />
    );
};

export default SearchProductBar;