const LOGO_URL = "https://res.cloudinary.com/dj86nz4oc/image/upload/v1783771654/Screenshot_2026-07-11_173717_xzc7lv.png"

export default function Logo({ size = 32, showText = true, textClassName = "" }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={LOGO_URL}
        alt="SpeedOpus Global"
        width={size}
        height={size}
        className="rounded-lg"
      />
      {showText && (
        <span className={`font-semibold tracking-tight ${textClassName}`}>
          SpeedOpus
        </span>
      )}
    </div>
  )
}