// Taille maximale d'un fichier importé (CV ou offre). Vercel refuse les envois de plus de 4,5 Mo :
// au-delà, la requête n'atteindrait même pas le site.
export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_FILE_LABEL = "4 Mo";

// Fichiers acceptés par les champs d'import (CV, offre) : documents et photos.
export const UPLOAD_ACCEPT = ".pdf,.docx,.txt,.md,image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";
export const UPLOAD_LABEL = "PDF, Word, texte ou photo";

// Photo de CV : réduite dans le navigateur avant l'envoi (une photo de téléphone dépasse souvent 4 Mo,
// et 2 000 pixels suffisent largement pour lire le texte). Les autres fichiers sont envoyés tels quels.
// Si le navigateur ne sait pas ouvrir l'image (HEIC sur certains ordinateurs), elle part telle quelle.
export async function prepareUpload(file: File): Promise<File> {
  const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
  if (!isImage || typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
