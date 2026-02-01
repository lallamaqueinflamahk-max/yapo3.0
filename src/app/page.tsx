import Button from "@/components/ui/Button";

export default function RootPage() {
  return (
    <div className="flex min-h-full flex-col gap-6 p-4">
      <h1 className="text-xl font-bold text-yapo-blue">YAPÓ 3.0</h1>
      <p className="text-foreground">Plataforma de identidad, reputación y confianza.</p>
      <div className="flex flex-col gap-3">
        <Button variant="red">Acción principal</Button>
        <Button variant="blue">Secundaria</Button>
        <Button variant="white">Terciaria</Button>
      </div>
    </div>
  );
}
