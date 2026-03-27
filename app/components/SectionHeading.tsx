type Props = {
  title: string;
  subtitle?: string;
};

export default function SectionHeading({ title, subtitle }: Props) {
  return (
    <div className="mb-12 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-3">
        {title.split(" ").map((word, i, arr) =>
          i === arr.length - 1 ? (
            <span key={i} className="gradient-text">
              {" "}
              {word}
            </span>
          ) : (
            <span key={i}>{i > 0 ? " " : ""}{word}</span>
          )
        )}
      </h2>
      {subtitle && (
        <p
          className="text-base max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          {subtitle}
        </p>
      )}
      <div
        className="mx-auto mt-4"
        style={{
          width: 60,
          height: 3,
          borderRadius: 2,
          background: "var(--gradient-accent)",
        }}
      />
    </div>
  );
}
