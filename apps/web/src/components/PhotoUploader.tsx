export default function PhotoUploader({ onChange }:{ onChange:(url:string)=>void }) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  return <input type="file" accept="image/*" onChange={handle} />;
}
