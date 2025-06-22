async function fetchProductByBarcode(barcode: string) {
  const response = await fetch(`https://world.openfoodfacts.net/api/v2/product/${barcode}.json`);
  if (!response.ok) {
    throw new Error('Could not fetch barcode data');
  }
  return await response.json();
}

export default fetchProductByBarcode;
