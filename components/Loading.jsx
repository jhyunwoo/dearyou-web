import { CogIcon } from "@heroicons/react/24/outline";

export default function Loading() {
  return (
    <div className="w-full h-screen bg-slate-50/50 backdrop-blur-sm flex justify-center items-center">
      <CogIcon className="w-12 h-12 text-slate-500 animate-spin" />
    </div>
  );
}
