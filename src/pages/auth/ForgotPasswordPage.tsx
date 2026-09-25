import React from "react";
import { Link } from "react-router-dom";
import { AppBrand } from "@/components/shared/AppBrand";

export const ForgotPasswordPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-lg space-y-4">
      <div className="inline-block">
        <AppBrand to="/" />
      </div>
      <h1 className="text-xl font-bold">No password to reset</h1>
      <p className="text-sm text-muted-foreground">
        This service uses single-use email sign-in links. Request a new link from the sign-in page.
      </p>
      <Link
        to="/auth/login"
        className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-4 font-semibold text-primary-foreground"
      >
        Return to sign in
      </Link>
    </section>
  </div>
);
