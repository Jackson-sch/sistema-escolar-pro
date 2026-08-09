"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconQuote,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CommentEntry {
  comment: string;
  teacherName: string;
  teacherImage?: string;
  courseName?: string;
}

interface TeacherCommentCardProps {
  comments: CommentEntry[];
  className?: string;
}

export function TeacherCommentCard({
  comments,
  className,
}: TeacherCommentCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % comments.length);
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, comments.length]);

  useEffect(() => {
    if (comments.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 8000);

    return () => clearInterval(interval);
  }, [comments.length, handleNext]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + comments.length) % comments.length);
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, comments.length]);

  if (comments.length === 0) return null;

  const current = comments[currentIndex];

  return (
    <Card
      className={cn(
        "min-h-[180px] rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-4 transition-[opacity,transform] duration-500",
          isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20 p-0.5">
              <AvatarImage
                src={current.teacherImage}
                alt={current.teacherName}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {current.teacherName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground/90">
                {current.teacherName}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                {current.courseName || "Tutor Académico"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {comments.length > 1 && (
              <div className="flex items-center gap-1 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-md hover:bg-primary/10"
                  onClick={handlePrev}
                >
                  <IconChevronLeft size={14} />
                </Button>
                <span className="text-[10px] font-mono opacity-50">
                  {currentIndex + 1}/{comments.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-md hover:bg-primary/10"
                  onClick={handleNext}
                >
                  <IconChevronRight size={14} />
                </Button>
              </div>
            )}
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <IconQuote size={20} stroke={1.5} />
            </div>
          </div>
        </div>

        <div className="leading-relaxed text-foreground/80">
          <p className="text-sm md:text-base font-medium">
            &quot;{current.comment}&quot;
          </p>
        </div>
      </div>
    </Card>
  );
}
