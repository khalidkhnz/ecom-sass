import React from "react";

interface HeadingProps {
  title: string;
  description?: string;
  size?: "default" | "sm" | "lg";
}

export const Heading: React.FC<HeadingProps> = ({
  title,
  description,
  size = "default",
}) => {
  let titleClass = "";
  let descriptionClass = "text-muted-foreground";

  switch (size) {
    case "sm":
      titleClass = "text-xl font-semibold tracking-tight";
      break;
    case "lg":
      titleClass = "text-4xl font-bold tracking-tight";
      break;
    default:
      titleClass = "text-3xl font-bold tracking-tight";
  }

  return (
    <div className="space-y-1">
      <h2 className={titleClass}>{title}</h2>
      {description && <p className={descriptionClass}>{description}</p>}
    </div>
  );
};
