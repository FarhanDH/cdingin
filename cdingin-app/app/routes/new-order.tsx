import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Header from '~/components/header';
import AcTypeStep from '~/customer/order/new/ac-type-step';
import LocationStep from '~/customer/order/new/location-step';
import ProblemsStep from '~/customer/order/new/problem-step';
import PropertyTypeStep from '~/customer/order/new/property-type-step';
import SummaryStep from '~/customer/order/new/summary.step';
import type { OrderFormData, OrderStep } from '~/types/order.types';

// Definisikan urutan step agar mudah dikelola
const steps: OrderStep[] = [
  'ac-problems',
  'location',
  'ac-type',
  'property-type',
  'summary',
];

type Step = (typeof steps)[number];

export default function NewOrder() {
  // State untuk menyimpan semua data dari setiap step
  const [formData, setFormData] = useState<Partial<OrderFormData>>({});

  // State untuk melacak step saat ini, dimulai dari index 0
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep: Step = steps[currentStepIndex];
  const navigate = useNavigate();

  useEffect(() => {
    if (
      currentStep === 'summary' &&
      formData.acUnits &&
      formData.acUnits.length === 0
    ) {
      navigate('/orders');
    }
  }, [formData.acUnits, currentStep, navigate]);

  // Fungsi untuk pindah ke step berikutnya
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  // Fungsi untuk kembali ke step sebelumnya
  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const navigateToStep = (stepName: Step) => {
    const stepIndex = steps.indexOf(stepName);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const handleProblemsSubmit = (data: { problems: string[] }) => {
    setFormData((prev) => ({ ...prev, problems: data.problems }));
    handleNext();
  };

  const handleLocationSubmit = (data: { location: string }) => {
    setFormData((prev) => ({ ...prev, location: data.location }));
    handleNext();
  };

  const handleAcTypeSubmit = (data: { acUnits: OrderFormData['acUnits'] }) => {
    setFormData((prev) => ({ ...prev, acUnits: data.acUnits }));
    handleNext();
  };

  const handleUpdateAcUnitQuantity = (unitId: string, newQuantity: number) => {
    // If quantity less than 1, delete item from list
    if (newQuantity < 1) {
      setFormData((prev) => ({
        ...prev,
        acUnits: prev.acUnits?.filter((unit) => unit.id !== unitId),
      }));
      return;
    }

    // If not, update quantity unit based on id
    setFormData((prev) => ({
      ...prev,
      acUnits: prev.acUnits?.map((unit) =>
        unit.id === unitId ? { ...unit, quantity: newQuantity } : unit,
      ),
    }));
  };

  const handlePropertyTypeSubmit = (data: {
    propertyType: { id: string; name: string } | null;
    floor: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      propertyType: {
        id: data.propertyType?.id || '',
        name: data.propertyType?.name || '',
      },
      floor: data.floor,
    }));
    handleNext();
  };

  // Fungsi baru untuk menangani konfirmasi pesanan terakhir
  const handleConfirmOrder = (data: { note: string; serviceDate: Date }) => {
    // Combine note and date before sending to the API
    const finalData = {
      ...formData,
      note: data.note,
      serviceDate: data.serviceDate,
    };

    alert('Pesanan sedang diproses!');
  };

  // Render komponen step yang sesuai
  const renderStep = () => {
    switch (currentStep) {
      case 'ac-problems':
        return (
          <ProblemsStep
            initialProblems={formData.problems || []}
            onSubmit={handleProblemsSubmit}
          />
        );
      case 'location':
        return (
          <LocationStep
            initialLocation={formData.location || ''}
            onSubmit={handleLocationSubmit}
            onBack={handlePrev}
          />
        );
      case 'ac-type':
        return (
          <AcTypeStep
            initialAcUnits={formData.acUnits || []}
            onSubmit={handleAcTypeSubmit}
            onBack={handlePrev}
          />
        );
      case 'property-type':
        return (
          <PropertyTypeStep
            initialPropertyType={formData.propertyType}
            initialFloor={formData.floor}
            onSubmit={handlePropertyTypeSubmit}
            onBack={handlePrev}
          />
        );
      case 'summary':
        return (
          <SummaryStep
            formData={formData}
            onConfirm={handleConfirmOrder}
            onUpdateQuantity={handleUpdateAcUnitQuantity}
            navigateToStep={navigateToStep}
          />
        );
      default:
        return null;
    }
  };

  return <div className="max-w-lg mx-auto bg-gray-50">{renderStep()}</div>;
}
