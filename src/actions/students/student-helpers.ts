/**
 * Limpia los datos convirtiendo strings vacíos en null para campos que deben ser únicos o nulos.
 * Esto evita errores de restricción única en la base de datos (PostgreSQL trata "" como un valor).
 */
export const sanitizeData = (data: any) => {
  const result = { ...data };
  const uniqueFields = [
    "email",
    "dni",
    "codigoEstudiante",
    "codigoSiagie",
    "codigoModular",
    "dniApoderado",
  ];

  uniqueFields.forEach((field) => {
    if (result[field] === "") {
      result[field] = null;
    }
  });

  return result;
};

/**
 * Intenta dividir un nombre completo en nombre, paterno y materno.
 */
export const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], paterno: "", materno: "" };
  if (parts.length === 2)
    return { name: parts[0], paterno: parts[1], materno: "" };
  if (parts.length === 3)
    return { name: parts[0], paterno: parts[1], materno: parts[2] };

  const materno = parts.pop() || "";
  const paterno = parts.pop() || "";
  const name = parts.join(" ");

  return { name, paterno, materno };
};
