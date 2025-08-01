import { useState } from 'react';
import Header from '~/components/header';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';

const acServices = [
  { id: 1, name: 'Cuci AC' },
  { id: 2, name: 'Pasang AC' },
  { id: 3, name: 'Bongkar AC' },
  { id: 4, name: 'Bongkar & pasang AC' },
  { id: 5, name: 'AC tidak dingin' },
  { id: 6, name: 'Air netes / bocor' },
  { id: 7, name: 'Suaranya berisik' },
  { id: 8, name: 'Udara lemah' },
  { id: 9, name: 'AC bau tidak sedap' },
  { id: 10, name: 'AC tidak menyala / mati mendadak' },
];

export default function ProblemsStep({
  initialProblems,
  onSubmit,
}: Readonly<{
  initialProblems: string[];
  onSubmit: (data: { problems: string[] }) => void;
}>) {
  const [selectedProblems, setSelectedProblems] =
    useState<string[]>(initialProblems);

  const toggleProblem = (problemName: string) => {
    setSelectedProblems((prev) =>
      prev.includes(problemName)
        ? prev.filter((p) => p !== problemName)
        : [...prev, problemName],
    );
  };

  const handleSubmit = () => {
    onSubmit({ problems: selectedProblems });
  };

  return (
    <>
      <Header title="Layanan / Keluhan" isSticky showBack />
      <div className="p-4 pb-28">
        {' '}
        {/* Tambahkan padding bottom agar tidak tertutup tombol navigasi */}
        <h1 className="text-xl font-semibold mb-4">AC kamu kenapa?</h1>
        {acServices.map((service) => {
          const isChecked = selectedProblems.includes(service.name);
          return (
            <Label
              key={service.id}
              htmlFor={`checkbox-${service.id}`}
              className={`flex items-center gap-3 border border-gray-300 p-3 rounded-lg mb-2 cursor-pointer ${
                isChecked ? 'bg-blue-50 border-blue-500' : 'bg-white'
              }`}
            >
              <Checkbox
                id={`checkbox-${service.id}`}
                checked={isChecked}
                onCheckedChange={() => toggleProblem(service.name)}
                className="h-5 w-5"
              />
              <span className="text-gray-700 text-lg">{service.name}</span>
            </Label>
          );
        })}
      </div>

      {/* Tombol Navigasi yang Terpusat */}
      <div className="w-full p-4 fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border">
        <Button
          onClick={handleSubmit}
          disabled={selectedProblems.length === 0}
          className="w-full h-[48px] rounded-full text-md font-semibold cursor-pointer"
        >
          Lanjut
        </Button>
      </div>
    </>
  );
}
