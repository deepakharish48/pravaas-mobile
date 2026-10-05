import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 118,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: "-0.08em",
            transform: "translateX(-3px)",
          }}
        >
          P
        </div>
        <div
          style={{
            position: "absolute",
            top: 23,
            right: 28,
            width: 11,
            height: 11,
            borderRadius: 3,
            background: "rgba(255,255,255,0.45)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 28,
            width: 11,
            height: 11,
            borderRadius: 3,
            background: "rgba(255,255,255,0.28)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 45,
            width: 11,
            height: 11,
            borderRadius: 3,
            background: "rgba(255,255,255,0.38)",
          }}
        />
      </div>
    ),
    size,
  );
}
