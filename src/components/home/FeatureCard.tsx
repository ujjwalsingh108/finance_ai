"use client";
import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  imageSrc: string;
  icon?: LucideIcon;
  iconClassName?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  imageSrc,
  icon: Icon,
  iconClassName = "",
}) => (
  <Card className="@container/card relative overflow-hidden transition-all duration-500 shadow-lg hover:scale-[1.03] bg-gradient-to-tr from-gray-50 to-transparent dark:bg-none cursor-pointer">
    <div className="px-2 relative">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={iconClassName} />}
        <span className="font-semibold text-sm dark:text-white text-black">
          {title}
        </span>
      </div>
    </div>
    <div className="flex items-center px-2 relative gap-2 mt-[-10px]">
      <div className="z-10 flex-1">
        <p className="text-xs dark:text-gray-300 text-gray-700">
          {description}
        </p>
      </div>
      <div className="z-0">
        <Image
          src={imageSrc}
          alt={title + " image"}
          width={96}
          height={96}
          className="opacity-90 object-cover"
          priority
        />
      </div>
    </div>
  </Card>
);
