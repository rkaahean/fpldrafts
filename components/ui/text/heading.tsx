export default function Heading(props: { text: string }) {
  return (
    <div className="text-xl font-semibold tracking-tight">{props.text}</div>
  );
}
