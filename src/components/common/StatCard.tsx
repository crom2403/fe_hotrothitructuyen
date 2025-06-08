import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, description, icon, color }: StatCardProps) => {
  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <span className={`w-4 h-4 ${color}`}>{icon}</span>
        </CardHeader>
        <CardContent>
          <div>{value}</div>
          <p>{description}</p>
        </CardContent>
      </Card>
    </>
  )
}

export default StatCard