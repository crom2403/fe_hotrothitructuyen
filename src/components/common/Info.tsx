interface InfoProps {
  label: string;
  value: string | React.ReactNode;
}

const Info = ({
  label,
  value,
}: InfoProps) => (
  <div>
    <span className="text-muted-foreground font-medium">{label}:</span>{" "}
    <span className="ml-1">{value}</span>
  </div>
);

export default Info;