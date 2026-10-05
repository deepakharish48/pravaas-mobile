import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
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
            fontSize: 330,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: "-0.08em",
            transform: "translateX(-8px)",
          }}
        >
          P
        </div>
        <div
          style={{
            position: "absolute",
            top: 64,
            right: 78,
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "rgba(255,255,255,0.45)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 110,
            right: 78,
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "rgba(255,255,255,0.28)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 110,
            right: 124,
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "rgba(255,255,255,0.38)",
          }}
        />
      </div>
    ),
    size,
  );
}
