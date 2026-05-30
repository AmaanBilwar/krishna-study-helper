import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type ParseStatusProps =
  | { state: "idle" }
  | { state: "parsing"; filename: string }
  | { state: "success"; filename: string; pageCount: number }
  | { state: "error"; message: string; hint?: string };

export function ParseStatus(props: ParseStatusProps) {
  if (props.state === "idle") return null;

  if (props.state === "parsing") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          <p className="font-medium">Parsing {props.filename}</p>
          <p className="text-muted-foreground">
            Large documents may take up to a minute.
          </p>
        </div>
      </div>
    );
  }

  if (props.state === "error") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Parse failed</p>
          <p className="text-muted-foreground">{props.message}</p>
          {props.hint && (
            <p className="mt-1 text-xs text-muted-foreground">{props.hint}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm",
      )}
    >
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <p className="font-medium">{props.filename}</p>
        <p className="text-muted-foreground">
          {props.pageCount} page{props.pageCount === 1 ? "" : "s"} parsed
        </p>
      </div>
    </div>
  );
}
