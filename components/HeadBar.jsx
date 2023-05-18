export default function HeadBar(props) {
  return (
    <div className="w-full bg-slate-50 p-3  flex justify-start fixed top-0 right-0 left-0">
      <div className="font-bold text-xl">{props.title}</div>
    </div>
  );
}
