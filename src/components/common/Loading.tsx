import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="text-center p-4">
      <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
    </div>
  );
};

export default Loading;
