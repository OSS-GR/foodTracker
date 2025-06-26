async function fetchProductByBarcode(barcode: string) {

  const headers = new Headers();
  headers.append("User-Agent", "foodTracker/0.0.1 (orestisstefanis@gmail.com)");

  const response = await fetch(
    `https://world.openfoodfacts.net/api/v2/product/${barcode}.json`,
    {
      method: "GET",
      headers: headers
    }
  );
  if (!response.ok) {
    throw new Error('Could not fetch barcode data');
  }
  return await response.json();
}

export default fetchProductByBarcode;
