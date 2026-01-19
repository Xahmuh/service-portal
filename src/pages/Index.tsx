import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { NewsPreviewSection } from "@/components/home/NewsPreviewSection";
import { CTASection } from "@/components/home/CTASection";
import { RegisterModal } from "@/components/auth/RegisterModal";
import { useLocation } from "react-router-dom";

const Index = () => {
  return (
    <MainLayout>
      <HeroSection showRegisterButton />
      <ProcessSteps />
      <NewsPreviewSection />
      <CTASection />
    </MainLayout>
  );
};

export default Index;
