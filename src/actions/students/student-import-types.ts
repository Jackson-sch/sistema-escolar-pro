export interface StudentImportPayload {
  dni: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  genero?: string;
  fechaNacimiento?: string;
  codigoSiagie?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  nivel?: string;
  grado?: string;
  seccion?: string;
  dniApoderado?: string;
  apoderadoNombre?: string;
  telefonoApoderado?: string;
  parentesco?: string;
}
