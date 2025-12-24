import { LoaderIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-12 animate-spin", className)}
      {...props}
    />
  )
}

export default function LoadingIcon() {
  return (
    <div className="grid place-items-center h-screen w-full fixed top-0 left-0 bg-white dark:bg-black z-50">
      <Spinner/>
    </div>
  )
}
