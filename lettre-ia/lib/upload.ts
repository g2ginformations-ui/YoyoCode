// Taille maximale d'un fichier importé (CV ou offre). Vercel refuse les envois de plus de 4,5 Mo :
// au-delà, la requête n'atteindrait même pas le site.
export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_FILE_LABEL = "4 Mo";
