// Reduce las fotos antes de guardarlas para no llenar el almacenamiento del dispositivo.
export async function reducirImagen(archivo, max = 1000) {
  const bmp = await createImageBitmap(archivo);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.8));
}

export const blobADataUrl = (blob) =>
  new Promise((ok, mal) => {
    const r = new FileReader();
    r.onload = () => ok(r.result);
    r.onerror = mal;
    r.readAsDataURL(blob);
  });

export const dataUrlABlob = async (url) => (await fetch(url)).blob();
