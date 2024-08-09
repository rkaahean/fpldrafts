export default function Heading(props: { text: string }) {
  return (
    <div className="text-xl 2xl:text-3xl font-semibold tracking-tight">
      {props.text}
    </div>
  );
}
