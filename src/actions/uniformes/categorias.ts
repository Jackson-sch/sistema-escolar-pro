"use server";
import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";

const DEFAULT_CATEGORIAS_TIENDA = [
  {
    nombre: "Libros y Textos",
    descripcion: "Libros del plan lector, textos escolares y cuadernos de trabajo.",
  },
  {
    nombre: "Agendas y Libretas",
    descripcion: "Agenda escolar oficial, libretas de control y cuadernos institucionales.",
  },
  {
    nombre: "Útiles y Accesorios",
    descripcion: "Mochilas, cartucheras, fotochecks, tomatodos y papelería escolar.",
  },
];

export async function ensureCategoriasTienda() {
  try {
    for (const cat of DEFAULT_CATEGORIAS_TIENDA) {
      await prisma.categoriaUniforme.upsert({
        where: { nombre: cat.nombre },
        update: { descripcion: cat.descripcion, activo: true },
        create: { nombre: cat.nombre, descripcion: cat.descripcion, activo: true },
      });
    }

    // Comprobar si existen productos no textiles (agendas, libros)
    const nonUniformCount = await prisma.uniforme.count({
      where: {
        categoria: {
          nombre: { in: ["Libros y Textos", "Agendas y Libretas", "Útiles y Accesorios"] },
        },
      },
    });

    if (nonUniformCount === 0) {
      const sede = await prisma.sede.findFirst();
      if (sede) {
        const catAgenda = await prisma.categoriaUniforme.findUnique({
          where: { nombre: "Agendas y Libretas" },
        });
        const catLibros = await prisma.categoriaUniforme.findUnique({
          where: { nombre: "Libros y Textos" },
        });

        if (catAgenda) {
          const existsAgenda = await prisma.uniforme.findFirst({
            where: { nombre: "Agenda Escolar Institucional 2026" },
          });
          if (!existsAgenda) {
            await prisma.uniforme.create({
              data: {
                nombre: "Agenda Escolar Institucional 2026",
                descripcion:
                  "Agenda oficial personalizada con cronograma anual, datos de contacto institucional y calendario escolar.",
                categoriaId: catAgenda.id,
                genero: "UNISEX",
                imagen: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
                variantes: {
                  create: [
                    {
                      talla: "Nivel Primaria",
                      precio: 25.0,
                      stock: 80,
                      stockMinimo: 10,
                      sedeId: sede.id,
                    },
                    {
                      talla: "Nivel Secundaria",
                      precio: 25.0,
                      stock: 75,
                      stockMinimo: 10,
                      sedeId: sede.id,
                    },
                  ],
                },
              },
            });
          }

          const existsLibreta = await prisma.uniforme.findFirst({
            where: { nombre: "Libreta de Control y Asistencia" },
          });
          if (!existsLibreta) {
            await prisma.uniforme.create({
              data: {
                nombre: "Libreta de Control y Asistencia",
                descripcion: "Libreta institucional para comunicación diaria entre docentes y padres de familia.",
                categoriaId: catAgenda.id,
                genero: "UNISEX",
                imagen: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80",
                variantes: {
                  create: [
                    {
                      talla: "Edición 2026",
                      precio: 15.0,
                      stock: 120,
                      stockMinimo: 15,
                      sedeId: sede.id,
                    },
                  ],
                },
              },
            });
          }
        }

        if (catLibros) {
          const existsLibro = await prisma.uniforme.findFirst({
            where: { nombre: "Libro Plan Lector: Paco Yunque y Otros Cuentos" },
          });
          if (!existsLibro) {
            await prisma.uniforme.create({
              data: {
                nombre: "Libro Plan Lector: Paco Yunque y Otros Cuentos",
                descripcion: "Texto escolar de lectura obligatoria con guía pedagógica y vocabulario contextual.",
                categoriaId: catLibros.id,
                genero: "UNISEX",
                imagen: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80",
                variantes: {
                  create: [
                    {
                      talla: "Primaria (3° a 6°)",
                      precio: 38.0,
                      stock: 45,
                      stockMinimo: 10,
                      sedeId: sede.id,
                    },
                  ],
                },
              },
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error al verificar categorías de tienda:", error);
  }
}

export async function getCategoriasUniformesAction() {
  try {
    await ensureCategoriasTienda();

    const categorias = await prisma.categoriaUniforme.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
    return { data: serialize(categorias) };
  } catch (error) {
    console.error("Error fetching uniform categories:", error);
    return { error: "No se pudieron obtener las categorías" };
  }
}
