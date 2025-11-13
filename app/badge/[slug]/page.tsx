'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

type RSVPEntry = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  department: string;
  job_title: string;
  country: string;
  attendance: string;
  hall: string;
  color?: string;
};

export default function BadgePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<RSVPEntry | null>(null);
  const hasPrinted = useRef(false);

  useEffect(() => {
    // Retrieve user data from localStorage
    const slug = params.slug as string;
    const userData = localStorage.getItem(`badge-${slug}`);
    console.log('Retrieved badge data for', slug, userData);

    if (userData) {
      setUser(JSON.parse(userData));

      // Auto-trigger print after component loads
      if (!hasPrinted.current) {
        hasPrinted.current = true;
        setTimeout(() => {
          window.print();
        }, 500);
      }
    }
  }, [params.slug]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading badge...</p>
      </div>
    );
  }

  return (
    <div className="h-[100vh]  ">
      <div className="print:hidden bg-background p-4 border-b">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Management
        </Button>
      </div>

      {/* Badge Design - optimized for printing */}
      <div className="flex w-full h-1/2 flex-row">
        <div className="flex-1 relative flex flex-col justify-center items-center">
          <Image src="/Bagde.svg" alt="badge" fill objectFit="contain" />
          <div className="w-3/4 h-12 flex justify-center items-center mt-[70%] ">
            <p className="text-black font-bold">{user.name}</p>
          </div>
          <div
            style={{ background: user.color }}
            className={`bg-[${
              user.color || '#E8C160'
            }] w-[90%] h-12 flex justify-center items-center `}
          >
            <p className="text-white font-bold uppercase">{user.hall}</p>
          </div>
        </div>

        {/* backdesign */}
        <div className="flex-1 relative">
          <Image src="/Back.svg" alt="badge" fill objectFit="contain" />
        </div>
      </div>
    </div>
  );
}
