'use client';

import { AnimatedSection } from "@/components/ui/animated-section";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { Briefcase, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineItem {
  title: string;
  organization: string;
  description: string;
  date: string;
  icon?: LucideIcon;
  type?: 'work' | 'education';
}

function TimelineCard({ title, organization, description, date, icon: Icon = Briefcase, type = 'work', index }: TimelineItem & { index: number }) {
  const isEven = index % 2 === 0;
  const isWork = type === 'work';
  return (
    <div className={cn(
      "relative flex w-full",
      isEven ? "justify-start" : "justify-end",
      "md:justify-normal md:even:flex-row-reverse",
      "my-8 md:my-0"
    )}>
      {/* Desktop timeline line */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 z-0" />
      {/* Mobile timeline line */}
      <div className="md:hidden absolute left-6 top-0 bottom-0 w-px bg-border z-0" />
      {/* Timeline dot */}
      <motion.div 
        className={cn(
          "absolute top-6 w-5 h-5 rounded-full border-2 z-10 bg-background flex items-center justify-center",
          isWork ? "border-primary" : "border-secondary",
          "md:left-1/2 md:-translate-x-1/2",
          "left-6 -translate-x-1/2"
        )}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.1 + 0.2 }}
      >
        <Icon className={cn("w-2.5 h-2.5", isWork ? "text-primary" : "text-secondary")} />
      </motion.div>
      <AnimatedSection 
        className="relative md:w-1/2"
        direction={isEven ? "right" : "left"}
        delay={index * 0.1}
        distance={20}
      >
        <div className={cn(
          "relative ml-12 md:ml-0 p-5 rounded-lg border bg-card shadow-sm",
          "md:w-[calc(50%_-_2.5rem)]",
          isEven ? "md:mr-10" : "md:ml-10"
        )}>
          {/* Arrow pointing to timeline */}
          <div className={cn(
            "absolute top-6 w-3 h-3 bg-card border transform rotate-45",
            isEven ? "-left-1.5 border-b-0 border-r-0 border-t border-l" : "-right-1.5 border-t-0 border-l-0 border-b border-r",
            "md:hidden"
          )}></div>
          <div className={cn(
            "absolute top-6 w-3 h-3 bg-card border transform rotate-45",
            isEven ? "md:-right-1.5 md:border-t-0 md:border-l-0 md:border-b md:border-r" : "md:-left-1.5 md:border-b-0 md:border-r-0 md:border-t md:border-l",
            "hidden md:block"
          )}></div>
          <div className="flex items-center mb-2">
            <span className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full mr-3",
              isWork ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
            )}>
              {date}
            </span>
            <h3 className="text-md font-semibold leading-tight">{title}</h3>
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{organization}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </AnimatedSection>
    </div>
  );
}

export function ExperienceTimeline({ 
  experience,
  title = "My Journey",
  subtitle = "A timeline of my professional experience and education in graphic design."
}: { 
  experience: TimelineItem[];
  title?: string;
  subtitle?: string;
}) {
  if (!experience.length) return null;
  return (
    <Section className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <SectionHeading 
          title={title}
          subtitle={subtitle}
          align="center"
        />
        <div className="relative flex flex-col items-center">
          {/* Desktop central line - drawn once */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 z-0" />
          {experience.map((item, index) => (
            <TimelineCard key={index} {...item} index={index} />
          ))}
        </div>
      </div>
    </Section>
  );
} 