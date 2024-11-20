// components/AuthGuard.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/react";

import MatrixService from "@/services/MatrixService"; // Adjust this import if necessary

interface AuthGuardProps {
  children: React.ReactNode;
  shouldRedirect?: boolean; // Optional prop with default value
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  shouldRedirect = true,
}) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = MatrixService.isLoggedIn();

      if (!isLoggedIn) {
        if (shouldRedirect) {
          router.replace("/login");
        } else {
          setAuthorized(false);
        }
      } else {
        setAuthorized(true);
      }
    };

    checkAuth();
  }, [router, shouldRedirect]);

  if (!authorized) {
    if (shouldRedirect) {
      // Optionally, render a loading state while redirecting
      return (
        <div className="w-full h-screen flex justify-center items-center">
          <Spinner color="primary" size="lg" />
        </div>
      );
    } else {
      // If not redirecting, render children regardless of authorization
      return <>{children}</>;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
