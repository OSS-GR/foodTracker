async function fetchFoodByName(productName: string) {

  const baseUrl = 'https://world.openfoodfacts.net/api/v2/search/';

  const headers = new Headers();
  headers.append("User-Agent", "foodTracker/0.0.1 (orestisstefanis@gmail.com)");
  headers.append('Accept', 'application/json');
  
  const searchParams = {
    search_terms: productName,
    fields: 'code,product_name,brands,nutrition_grades,nutriments,quantity,serving_size,nutriscore_data,nova_group',
    page_size: 10,  // Reasonable page size
    page: 1
  };
  try {
    const response = await fetch(
      `${baseUrl}?${searchParams}`,
      {
        method: "GET",
        headers: headers
      }
    );
    if (!response.ok) {
      throw new Error(`Could not fetch food data. Error: ${response.status}`);
    }
    const data = await response.json()
    return data;
  } catch(error) {
    console.error(`Search Failed for food: ${productName}`, error)
    throw error;
  }
}

export default fetchFoodByName;
