// WORKING Search-a-licious implementation based on your successful cURL
async function fetchFoodByName(productName: string) {
  try {
    return await fetchFoodByNameSearchALicious(productName);
  } catch (error) {
    console.warn('Search-a-licious failed, falling back to V1 API:', error);
    return await fetchFoodByNameV1(productName);
  }
}

// Search-a-licious API (using the CORRECT endpoint from your cURL)
async function fetchFoodByNameSearchALicious(productName: string) {
  // ✅ CORRECT endpoint: /search (not /api/v1/search)
  const baseUrl = 'https://search.openfoodfacts.org/search';

  const headers = new Headers();
  headers.append("User-Agent", "foodTracker/0.0.1 (orestisstefanis@gmail.com)");
  headers.append('Accept', 'application/json');
  
  // Use the exact same parameters as your working cURL
  const searchParams = new URLSearchParams({
    q: productName,                                                    // Search query
    page_size: '10',                                                  // Number of results
    page: '1',                                                        // Page number
    fields: 'product_name,generic_name,code,categ÷ories,nutriscore_data,quantity', // Exact fields from cURL
    // No sort_by - let it use default relevance
  });

  const response = await fetch(`${baseUrl}?${searchParams.toString()}`, {
    method: "GET",
    headers: headers
  });
  
  if (!response.ok) {
    throw new Error(`Search-a-licious API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Check for errors in the response
  if (data.errors && data.errors.length > 0) {
    console.warn('Search-a-licious returned errors:', data.errors);
    throw new Error(`Search-a-licious errors: ${data.errors.map(e => e.description).join(', ')}`);
  }
  
  return data;
}

// Enhanced version with more fields and sorting options
async function fetchFoodByNameEnhanced(
  productName: string,
  options: {
    pageSize?: number;
    page?: number;
    includeNutrients?: boolean;
    sortBy?: string;
  } = {}
) {
  const baseUrl = 'https://search.openfoodfacts.org/search';

  const headers = new Headers();
  headers.append("User-Agent", "foodTracker/0.0.1 (orestisstefanis@gmail.com)");
  headers.append('Accept', 'application/json');
  
  // Base fields (matching your cURL)
  let fields = 'product_name,generic_name,code,categories,nutriscore_data,quantity';
  
  // Add nutrition fields if requested
  if (options.includeNutrients) {
    fields += ',nutriments,serving_size,nutrition_grades';
  }
  
  const searchParams = new URLSearchParams({
    q: productName,
    page_size: (options.pageSize || 10).toString(),
    page: (options.page || 1).toString(),
    fields: fields,
  });

  // Add sorting if specified (be careful - some fields don't work)
  if (options.sortBy) {
    searchParams.append('sort_by', options.sortBy);
  }

  try {
    const response = await fetch(`${baseUrl}?${searchParams.toString()}`, {
      method: "GET",
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`Search-a-licious API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle errors gracefully
    if (data.errors && data.errors.length > 0) {
      console.warn('Search-a-licious errors:', data.errors);
      
      // If sorting caused the error, retry without it
      if (options.sortBy) {
        console.warn('Retrying without sorting...');
        const optionsWithoutSort = { ...options };
        delete optionsWithoutSort.sortBy;
        return await fetchFoodByNameEnhanced(productName, optionsWithoutSort);
      }
      
      throw new Error(`Search-a-licious errors: ${data.errors.map(e => e.description).join(', ')}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Search-a-licious enhanced failed for: ${productName}`, error);
    throw error;
  }
}

// V1 fallback (unchanged)
async function fetchFoodByNameV1(productName: string) {
  const baseUrl = 'https://world.openfoodfacts.org/cgi/search.pl';

  const headers = new Headers();
  headers.append("User-Agent", "foodTracker/0.0.1 (orestisstefanis@gmail.com)");
  headers.append('Accept', 'application/json');
  
  const searchParams = new URLSearchParams({
    search_terms: productName,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '20',
  });

  const response = await fetch(`${baseUrl}?${searchParams.toString()}`, {
    method: "GET", 
    headers: headers
  });
  
  if (!response.ok) {
    throw new Error(`V1 API error: ${response.status}`);
  }
  
  return await response.json();
}

// Usage examples:
export const searchExamples = {
  // Basic search (matches your cURL exactly)
  basic: (query: string) => fetchFoodByName(query),
  
  // Enhanced search with more fields
  withNutrients: (query: string) => fetchFoodByNameEnhanced(query, { 
    includeNutrients: true,
    pageSize: 20 
  }),
  
  // Paginated search
  paginated: (query: string, page: number) => fetchFoodByNameEnhanced(query, { 
    page,
    pageSize: 10 
  }),
};

export default fetchFoodByName;