import logo from "@/assets/logo.png";
export function Logo({ className = "h-8" }: { className?: string }) {
  return <img src={logo} alt="DRMOSH TV" width={1536} height={512} className={`${className} w-auto mix-blend-lighten`} />;
}
