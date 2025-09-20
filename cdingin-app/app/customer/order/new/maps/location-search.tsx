import { Button, IconButton } from "@mui/material";
import axios from "axios";
import { debounce } from "lodash";
import { Search, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Input } from "~/components/ui/input";

interface SearchResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface LocationSearchProps {
    onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

/**
 * A component for searching locations using the Nominatim API.
 * It provides an input field and displays a list of search results.
 */
export default function LocationSearch({
    onLocationSelect,
}: Readonly<LocationSearchProps>) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce the search function to avoid excessive API calls while the user is typing.
    // This function wraps the actual search function and waits for 500ms after the user
    // stops typing before calling the actual search function.
    const debouncedSearch = useCallback(
        debounce(
            /**
             * Searches for locations using the Nominatim API.
             * @param {string} searchQuery - The search query entered by the user.
             */
            async function search(searchQuery: string) {
                if (searchQuery.length < 3) {
                    // If the search query is too short, don't search and clear the results.
                    setResults([]);
                    return;
                }
                setIsLoading(true);
                try {
                    // Make a GET request to the Nominatim API with the search query and other parameters.
                    const response = await axios.get(
                        "https://nominatim.openstreetmap.org/search",
                        {
                            params: {
                                /**
                                 * The search query entered by the user, with a hint to prioritize results in Samarinda.
                                 * Nominatim will try to find a match in Samarinda first, and then expand the search to
                                 * the rest of the world.
                                 */
                                q: `${searchQuery}, Samarinda`,
                                format: "json",
                                addressdetails: 1,
                                limit: 5,
                            },
                        }
                    );
                    // Set the search results to the response from Nominatim.
                    setResults(response.data);
                } catch (error) {
                    console.error("Failed to search location:", error);
                } finally {
                    // Set the loading state to false, whether the search was successful or not.
                    setIsLoading(false);
                }
            },
            // Wait for 500ms after the user stops typing before calling the actual search function.
            500
        ),
        // No dependencies for the debounced search function.
        []
    );

    /**
     * Handles the user changing the search query in the input field.
     *
     * When the user types in the input field, this function is called with the new
     * search query. It sets the state of the component to the new search query, and
     * then calls the debounced search function with the new search query.
     *
     * The debounced search function is a wrapper around the actual search function
     * that prevents excessive API calls while the user is typing. It waits for a
     * certain amount of time (in this case, 500ms) after the user stops typing
     * before calling the actual search function.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the
     * input field.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        debouncedSearch(newQuery); // Call the debounced search function with the new search query.
    };

    /**
     * Handles the user clicking on a search result.
     *
     * This function takes the selected search result and calls the onLocationSelect callback
     * with the latitude and longitude of the selected location.
     *
     * It also clears the search query and search results, so that the user can start a new
     * search.
     *
     * @param {SearchResult} result - The selected search result.
     */
    const handleResultClick = (result: SearchResult) => {
        // Call the onLocationSelect callback with the selected location's coordinates.
        onLocationSelect({
            lat: parseFloat(result.lat), // Convert the latitude from a string to a number.
            lng: parseFloat(result.lon), // Convert the longitude from a string to a number.
        });

        // Clear the search query to an empty string.
        setQuery("");

        // Clear the search results to an empty array.
        setResults([]);
    };

    /**
     * Clears the search query and search results.
     *
     * This is used when the user wants to cancel the search and clear the search results.
     */
    const clearSearch = () => {
        // Reset the search query to an empty string.
        setQuery("");
        // Reset the search results to an empty array.
        setResults([]);
    };

    return (
        <div className="relative w-full rounded-full bg-white">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Cari nama jalan atau tempat..."
                    className="pl-10 h-12 text-md rounded-full"
                />
                {query && (
                    <IconButton
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </IconButton>
                )}
            </div>
            {/* Search Results */}
            {(results.length > 0 || isLoading) && (
                <div className="absolute top-full w-full bg-white rounded-3xl shadow-lg border z-30">
                    {isLoading && (
                        <div className="p-4 text-center text-gray-500">
                            Mencari...
                        </div>
                    )}
                    <ul className="divide-y divide-gray-200">
                        {results.map((result) => (
                            <li
                                key={result.place_id}
                                className="p-4 hover:bg-gray-100 cursor-pointer hover:rounded-3xl"
                            >
                                <Button
                                    onClick={() => handleResultClick(result)}
                                    className="w-full text-left flex  gap-2 items-center justify-between text-sm !font-[Rubik] normal-case"
                                >
                                    <p className="font-semibold text-primary">
                                        {result.display_name.split(",")[0]}
                                    </p>
                                    <p className="text-sm text-gray-600 truncate">
                                        {result.display_name}
                                    </p>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
