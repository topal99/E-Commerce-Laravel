'use client';

import * as React from "react"; // <-- PERBAIKAN UTAMA DI SINI
import { cn } from "@/lib/utils";
import { CheckCircle2, Package, Truck, Home, XCircle } from "lucide-react";

interface OrderStatusProgressProps {
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

// Definisikan langkah-langkah progres
const steps = [
  { name: 'Processing', status: 'processing', icon: Package },
  { name: 'Shipped', status: 'shipped', icon: Truck },
  { name: 'Delivered', status: 'delivered', icon: Home },
];

export default function OrderStatusProgress({ status }: OrderStatusProgressProps) {
  // Cari indeks dari status saat ini
  const currentStepIndex = steps.findIndex(step => step.status === status);

  // Handle jika statusnya 'cancelled'
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <XCircle className="w-5 h-5" />
        <span className="font-semibold">Pesanan Dibatalkan</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = currentStepIndex >= index;
          const isCurrent = currentStepIndex === index;
          
          return (
            <React.Fragment key={step.name}>
              {/* Node (lingkaran ikon) */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500",
                    isCompleted ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                  )}
                >
                  {currentStepIndex > index ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                </div>
                <p className={cn(
                  "text-xs font-semibold",
                  isCompleted ? "text-blue-600" : "text-gray-500"
                )}>
                  {step.name}
                </p>
              </div>

              {/* Garis penghubung (tidak ditampilkan setelah langkah terakhir) */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-gray-200 rounded">
                  <div 
                    className={cn(
                      "h-1 rounded transition-all duration-500",
                      isCompleted ? "bg-blue-600" : ""
                    )}
                    style={{ width: isCurrent ? '50%' : isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}