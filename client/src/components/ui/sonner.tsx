import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "!bg-black/60 !backdrop-blur-2xl !text-white !border !border-white/20 !shadow-2xl",
          description: "!text-zinc-400",
          actionButton:
            "!bg-primary !text-primary-foreground",
          cancelButton:
            "!bg-zinc-800 !text-zinc-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
