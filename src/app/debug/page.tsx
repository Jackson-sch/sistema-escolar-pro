import prisma from "@/lib/prisma";
import { getPortalCommunicationsAction } from "@/actions/portal";

export default async function DebugPage({
  searchParams,
}: {
  searchParams: Promise<{ hijoId?: string }>;
}) {
  const { hijoId } = await searchParams;
  const allAnuncios = await prisma.anuncio.findMany({
    include: {
      niveles: true,
      grados: true,
    },
  });

  const portalActionData = await getPortalCommunicationsAction(
    hijoId || "todos",
  );

  const studentDetails =
    hijoId && hijoId !== "todos"
      ? await prisma.user.findUnique({
          where: { id: hijoId },
          include: { nivelAcademico: true },
        })
      : null;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Debug Anuncios</h1>

      {studentDetails && (
        <section>
          <h2 className="text-xl font-bold mb-4">Student Details ({hijoId})</h2>
          <pre className="bg-muted p-4 rounded overflow-auto max-h-[400px]">
            {JSON.stringify(studentDetails, null, 2)}
          </pre>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-4">All Anuncios in DB</h2>
        <pre className="bg-muted p-4 rounded overflow-auto max-h-[400px]">
          {JSON.stringify(allAnuncios, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">
          Portal Action Data (hijoId: {hijoId || "todos"})
        </h2>
        <pre className="bg-muted p-4 rounded overflow-auto max-h-[400px]">
          {JSON.stringify(portalActionData, null, 2)}
        </pre>
      </section>
    </div>
  );
}
