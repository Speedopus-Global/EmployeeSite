import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4 text-center">
      <div className="grid place-items-center">
        <svg
          viewBox="0 0 120 120"
          className="col-start-1 row-start-1 h-64 w-64 animate-[float_3s_ease-in-out_infinite] opacity-[0.12] sm:h-72 sm:w-72"
        >
          <ellipse cx="60" cy="100" rx="30" ry="4" fill="currentColor" className="text-foreground" />
          <path
            d="M35 45h45l-4 38a10 10 0 0 1-10 9H49a10 10 0 0 1-10-9z"
            fill="currentColor"
            className="text-foreground"
          />
          <path
            d="M80 52c10-2 18 3 18 12s-8 15-18 13"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            className="text-foreground"
          />
          <path
            d="M45 38c-2-5 2-7 1-12M58 38c-2-5 2-7 1-12M71 38c-2-5 2-7 1-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-foreground"
          />
        </svg>

        <span className="col-start-1 row-start-1 select-none text-[7rem] font-bold leading-none text-foreground sm:text-[9rem]">
          404
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-8xl font-semibold tracking-tight">Page not found</h1>
        <p className="mx-auto max-w-sm text-muted-foreground">
          This page went out for coffee and never came back.
          <br />
          Let's get you back where the adventure begins.
        </p>
      </div>

      <Button asChild size="lg">
        <Link to="/">← Back to Home</Link>
      </Button>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}