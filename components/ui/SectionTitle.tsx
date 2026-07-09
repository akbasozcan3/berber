import { splitTitleLines } from "@/lib/data/home-content";

interface SectionTitleProps {
  title: string;
  fallbackLine1: string;
  fallbackLine2?: string;
  className?: string;
  line2ClassName?: string;
  as?: "h1" | "h2" | "h3";
}

export default function SectionTitle({
  title,
  fallbackLine1,
  fallbackLine2 = "",
  className = "",
  line2ClassName = "",
  as: Tag = "h2",
}: SectionTitleProps) {
  const [line1, line2] = splitTitleLines(title, fallbackLine1, fallbackLine2);

  return (
    <Tag className={className}>
      {line1}
      {line2 ? (
        <>
          <br />
          <span className={line2ClassName}>{line2}</span>
        </>
      ) : null}
    </Tag>
  );
}
