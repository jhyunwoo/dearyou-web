import { CogIcon } from "@heroicons/react/24/outline";

export default function Loading() {
  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 w-full h-screen touch-none bg-slate-50/30 flex justify-center items-center">
      <CogIcon className="w-12 h-12 text-slate-500 animate-spin" />
    </div>
  );
}
