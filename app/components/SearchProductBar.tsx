import debounce from "lodash.debounce";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { SearchBar } from "react-native-elements";

interface SearchProductBarProps {
    onSearch?: (query: string) => void;
}

const SearchProductBar: React.FC<SearchProductBarProps> = ({ onSearch }) => {
    const [searchText, setSearchText] = useState("");

    // Use lodash debounce to avoid multiple API calls while typing

    const debouncedSearch = useMemo(
        () =>
            debounce((query: string) => {
                if (onSearch) onSearch(query);
            }, 500),
        [onSearch]
    );

    useEffect(() => {
        debouncedSearch(searchText);
        // Cancel debounce on unmount
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchText, debouncedSearch]);

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
            value={searchText}
            onChangeText={setSearchText as any}
            placeholder="Search for a product..."
            loadingProps={{}}
            round={true}
            containerStyle={styles.container}
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.input}
            placeholderTextColor="#64748B"
            onClear={() => setSearchText("")}
            onCancel={() => setSearchText("")}
            onFocus={() => {}}
            onBlur={() => {}}
            cancelButtonTitle="Cancel"
            cancelButtonProps={{}}
        />
    );
};

export default SearchProductBar;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        borderBottomWidth: 0,
        padding: 0,
        marginBottom: 12,
        width: '100%',
        alignSelf: 'center',
    },
    inputContainer: {
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        height: 44,
        borderBottomWidth: 0,
    },
    input: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: '500',
    },
});