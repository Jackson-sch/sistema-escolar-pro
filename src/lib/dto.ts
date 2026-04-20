/**
 * Utilidad eficiente para serializar datos de Prisma (incluyendo Fechas y Decimales)
 * para que puedan ser enviados de Server Actions a Client Components sin usar 
 * JSON.parse(JSON.stringify(data)).
 */

export function serialize<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (data instanceof Date) {
    return data.toISOString() as any;
  }

  if (Array.isArray(data)) {
    return data.map(serialize) as any;
  }

  if (typeof data === "object") {
    const serialized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serialize(data[key]);
      }
    }
    return serialized;
  }

  return data;
}

/**
 * Helper para formatear nombres de usuarios de forma consistente
 */
export function formatFullName(user: { name?: string | null; apellidoPaterno?: string | null; apellidoMaterno?: string | null }) {
  if (!user) return "";
  const parts = [
    user.apellidoPaterno,
    user.apellidoMaterno,
    user.name ? `, ${user.name}` : ""
  ].filter(Boolean);
  
  // Si no hay apellidos, solo devolver el nombre
  if (parts.length === 1 && user.name) return user.name;
  
  return parts.join(" ").trim();
}
